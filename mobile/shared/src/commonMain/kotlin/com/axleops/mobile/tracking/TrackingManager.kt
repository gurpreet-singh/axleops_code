package com.axleops.mobile.tracking

import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.platform.LocationPermissionHandler
import com.axleops.mobile.tracking.data.LocationBufferRepository
import com.axleops.mobile.tracking.model.LocationPermissionState
import com.axleops.mobile.tracking.model.StopReason
import com.axleops.mobile.tracking.model.TrackingEvent
import com.axleops.mobile.tracking.model.TrackingState
import com.axleops.mobile.tracking.sync.BatchSyncWorker
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant
import kotlin.uuid.ExperimentalUuidApi

/**
 * Production GPS tracking manager.
 *
 * Orchestrates the full tracking lifecycle:
 * 1. Permission check via [LocationPermissionHandler]
 * 2. State machine transitions via [TrackingStateMachine]
 * 3. GPS capture via [LocationTracker]
 * 4. Offline buffering via [LocationBufferRepository]
 * 5. Batch sync via [BatchSyncWorker]
 *
 * ## Lifecycle
 * - `start(tripId)` → checks permission → transitions state → starts tracker + sync
 * - `stop(reason)` → stops tracker → final flush → transitions to STOPPED
 * - GPS signal lost/restored detection runs continuously during active tracking
 * - 48-hour auto-stop safety net runs alongside tracking
 *
 * Source: spec §3.3, plan §2, plan §5
 */
class TrackingManager(
    private val stateMachine: TrackingStateMachine,
    private val locationTracker: LocationTracker,
    private val locationBufferRepository: LocationBufferRepository,
    private val locationPermissionHandler: LocationPermissionHandler,
    private val batchSyncWorker: BatchSyncWorker,
    /** Capture interval — 5 minutes per spec §3.2. */
    private val trackingIntervalMs: Long = 5L * 60 * 1000,
    /** Signal lost threshold — 2 consecutive missed intervals (10 min). */
    private val signalLostThresholdMs: Long = 10L * 60 * 1000,
    /** Auto-stop safety net — 48 hours continuous. */
    private val autoStopThresholdMs: Long = 48L * 60 * 60 * 1000,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    // Active jobs
    private var captureJob: Job? = null
    private var signalMonitorJob: Job? = null
    private var safetyNetJob: Job? = null

    // State
    private var activeTripId: Long? = null
    private var trackingStartTime: Instant? = null
    private var lastFixTime: Instant? = null

    // Events
    private val _events = MutableSharedFlow<TrackingEvent>(extraBufferCapacity = 32)
    /** Tracking events for diagnostics and UI. */
    val events: SharedFlow<TrackingEvent> = _events.asSharedFlow()

    /** Observable tracking state — delegates to [TrackingStateMachine]. */
    val trackingState: StateFlow<TrackingState> = stateMachine.state

    /** Current state value (non-flow). */
    val currentState: TrackingState get() = stateMachine.currentState

    // ---- Lifecycle ----

    /**
     * Start tracking for a trip.
     *
     * Flow: check permission → transition state → start GPS → start sync
     *
     * @param tripId The trip to track.
     * @param skipPermissionCheck If true, skip the permission pre-prompt
     *   (used on app relaunch where permission was already checked).
     */
    @OptIn(ExperimentalUuidApi::class)
    fun start(tripId: Long, skipPermissionCheck: Boolean = false) {
        if (currentState.isActive) {
            println("[TrackingManager] Already tracking — ignoring start")
            return
        }

        activeTripId = tripId

        scope.launch {
            // Step 1: Transition to AWAITING_PERMISSION
            stateMachine.onTripDeparted()

            // Step 2: Check permission
            val permissionState = if (skipPermissionCheck) {
                locationPermissionHandler.checkCurrentState()
            } else {
                locationPermissionHandler.checkCurrentState()
            }

            // Step 3: React to permission result
            when {
                permissionState is LocationPermissionState.ForegroundAndBackground -> {
                    stateMachine.onPermissionGranted(fullAccess = true)
                    startCaptureLoop(tripId)
                }
                permissionState.canTrackForeground -> {
                    stateMachine.onPermissionGranted(fullAccess = false)
                    startCaptureLoop(tripId)
                }
                permissionState.isDenied -> {
                    stateMachine.onPermissionDenied()
                    // Trip continues without tracking — non-blocking per spec §4.3
                    println("[TrackingManager] Permission denied — trip continues without GPS")
                }
                else -> {
                    // NotDetermined — permission dialog hasn't been shown yet.
                    // The UI layer (permission pre-prompt) will handle this and
                    // call back into start() or onPermissionResult().
                    stateMachine.onPermissionDenied()
                    println("[TrackingManager] Permission not determined — waiting for UI flow")
                }
            }
        }
    }

    /**
     * Called by the UI layer after the OS permission dialog completes.
     * Resumes the start flow with the updated permission state.
     */
    fun onPermissionResult(granted: Boolean, fullAccess: Boolean) {
        val tripId = activeTripId ?: return

        if (granted) {
            stateMachine.onPermissionGranted(fullAccess)
            scope.launch { startCaptureLoop(tripId) }
        } else {
            stateMachine.onPermissionDenied()
            println("[TrackingManager] Permission denied via dialog — trip continues without GPS")
        }
    }

    /**
     * Stop tracking and perform final cleanup.
     *
     * @param reason Why tracking is being stopped.
     */
    fun stop(reason: StopReason = StopReason.TRIP_STATE_CHANGE) {
        val tripId = activeTripId ?: return

        // Stop GPS capture
        locationTracker.stopTracking()
        captureJob?.cancel()
        signalMonitorJob?.cancel()
        safetyNetJob?.cancel()
        captureJob = null
        signalMonitorJob = null
        safetyNetJob = null

        // Transition state
        stateMachine.onTripArrived()

        // Final sync flush
        scope.launch {
            batchSyncWorker.stop()
        }

        // Emit stop event
        scope.launch {
            _events.emit(
                TrackingEvent.TrackingStopped(
                    timestamp = Clock.System.now(),
                    tripId = tripId,
                    reason = reason,
                )
            )
        }

        println("[TrackingManager] Stopped tracking for trip $tripId (reason: $reason)")
    }

    /**
     * Reset all tracking state. Called when trip context changes
     * (trip settled, driver signs out, new trip loaded).
     */
    fun reset() {
        locationTracker.stopTracking()
        captureJob?.cancel()
        signalMonitorJob?.cancel()
        safetyNetJob?.cancel()
        captureJob = null
        signalMonitorJob = null
        safetyNetJob = null
        activeTripId = null
        trackingStartTime = null
        lastFixTime = null
        stateMachine.onTripReset()
        println("[TrackingManager] Reset")
    }

    /**
     * Handle permission revocation while tracking is active.
     * Called when the system detects permission change.
     */
    fun onPermissionRevoked() {
        if (currentState.isActive) {
            locationTracker.stopTracking()
            captureJob?.cancel()
            captureJob = null
            stateMachine.onPermissionRevoked()
            println("[TrackingManager] Permission revoked during active tracking")
        }
    }

    /**
     * Handle permission re-grant after revocation.
     */
    fun onPermissionRestored(fullAccess: Boolean) {
        val tripId = activeTripId ?: return
        if (currentState == TrackingState.PERMISSION_DENIED) {
            stateMachine.onPermissionGranted(fullAccess)
            scope.launch { startCaptureLoop(tripId) }
        }
    }

    // ---- Internal: Capture Loop ----

    @OptIn(ExperimentalUuidApi::class)
    private suspend fun startCaptureLoop(tripId: Long) {
        val now = Clock.System.now()
        trackingStartTime = now
        lastFixTime = now

        // Start the platform tracker
        locationTracker.startTracking(trackingIntervalMs)

        // Start the batch sync worker
        batchSyncWorker.start(tripId)

        // Emit start event
        _events.emit(
            TrackingEvent.TrackingStarted(
                timestamp = now,
                tripId = tripId,
            )
        )

        // GPS capture loop — reads from LocationTracker's Flow
        captureJob = scope.launch {
            locationTracker.lastLocation.collect { gpsLocation ->
                if (gpsLocation != null) {
                    val point = LocationPoint(
                        clientId = LocationPoint.generateClientId(),
                        latitude = gpsLocation.latitude,
                        longitude = gpsLocation.longitude,
                        accuracy = gpsLocation.accuracyMeters,
                        timestamp = Clock.System.now().toString(),
                        speed = null, // Platform tracker will populate these
                        bearing = null,
                        altitude = null,
                        provider = null,
                        batteryLevel = null,
                    )

                    locationBufferRepository.insert(point, tripId)
                    lastFixTime = Clock.System.now()

                    // Check if we need to trigger sync (threshold-based)
                    // The BatchSyncWorker handles timer-based and connectivity-based triggers
                    println("[TrackingManager] Captured point ${point.clientId.take(8)}… for trip $tripId")
                }
            }
        }

        // Start signal lost monitor (T019)
        startSignalLostMonitor()

        // Start 48h safety net (T020)
        startSafetyNet(tripId)

        println("[TrackingManager] Capture loop started for trip $tripId")
    }

    // ---- Internal: Signal Lost Detection (T019) ----

    private fun startSignalLostMonitor() {
        signalMonitorJob = scope.launch {
            while (isActive) {
                delay(signalLostThresholdMs / 2) // Check every 5 min

                val lastFix = lastFixTime ?: continue
                val elapsed = Clock.System.now() - lastFix

                if (elapsed.inWholeMilliseconds >= signalLostThresholdMs) {
                    if (currentState == TrackingState.ACTIVE || currentState == TrackingState.ACTIVE_DEGRADED) {
                        stateMachine.onGpsSignalLost()
                        _events.emit(
                            TrackingEvent.GpsSignalLost(
                                timestamp = Clock.System.now(),
                            )
                        )
                        println("[TrackingManager] GPS signal lost (no fix for ${elapsed.inWholeMinutes} min)")

                        // Wait for signal restoration
                        waitForSignalRestoration()
                    }
                }
            }
        }
    }

    /**
     * Wait for GPS signal to be restored (new fix received).
     * This blocks the monitor loop until either a fix is received or tracking stops.
     */
    private suspend fun waitForSignalRestoration() {
        val lostTime = Clock.System.now()
        while (currentState == TrackingState.SIGNAL_LOST) {
            delay(30_000) // Check every 30s
            val lastFix = lastFixTime ?: continue
            if (lastFix > lostTime) {
                // Signal restored
                val gapMs = (Clock.System.now() - lostTime).inWholeMilliseconds
                stateMachine.onGpsSignalRestored()
                _events.emit(
                    TrackingEvent.GpsSignalRestored(
                        timestamp = Clock.System.now(),
                        latitude = 0.0, // Will be populated by actual fix
                        longitude = 0.0,
                        gapDurationMs = gapMs,
                    )
                )
                println("[TrackingManager] GPS signal restored after ${gapMs / 1000}s gap")
                break
            }
        }
    }

    // ---- Internal: 48h Safety Net (T020) ----

    private fun startSafetyNet(tripId: Long) {
        safetyNetJob = scope.launch {
            while (isActive) {
                delay(60L * 60 * 1000) // Check every hour

                val startTime = trackingStartTime ?: continue
                val elapsed = Clock.System.now() - startTime

                if (elapsed.inWholeMilliseconds >= autoStopThresholdMs) {
                    println("[TrackingManager] 48h safety net triggered — auto-stopping")
                    stop(StopReason.SAFETY_NET_48H)
                    break
                }
            }
        }
    }
}
