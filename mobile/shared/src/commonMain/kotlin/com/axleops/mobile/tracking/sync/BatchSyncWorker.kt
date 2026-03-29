package com.axleops.mobile.tracking.sync

import com.axleops.mobile.db.BufferedLocationPoint
import com.axleops.mobile.domain.repository.BatchLogResult
import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository
import com.axleops.mobile.platform.ConnectivityObserver
import com.axleops.mobile.tracking.data.LocationBufferRepository
import com.axleops.mobile.tracking.model.BatchErrorType
import com.axleops.mobile.tracking.model.TrackingEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock
import kotlin.math.min
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Periodic sync orchestrator for buffered location points.
 *
 * Batches pending points from [LocationBufferRepository] and submits
 * them to the backend via [LocationRepository]. Handles:
 *
 * 1. **Threshold trigger**: syncs when pending count ≥ [BATCH_THRESHOLD]
 * 2. **Timer trigger**: syncs every [TIMER_INTERVAL_MS] (15 min)
 * 3. **Connectivity trigger**: flushes immediately when network is restored
 * 4. **Retry with backoff**: exponential backoff on failure (30s → 10m cap)
 * 5. **Auth failure**: stops retrying on 401 (session expired)
 *
 * Source: spec §7.2, §7.5, plan §8
 */
class BatchSyncWorker(
    private val locationBufferRepository: LocationBufferRepository,
    private val locationRepository: LocationRepository,
    private val connectivityObserver: ConnectivityObserver,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var timerJob: Job? = null
    private var connectivityJob: Job? = null
    private var syncJob: Job? = null

    private var activeTripId: Long? = null
    private var currentBackoffMs: Long = INITIAL_BACKOFF_MS
    private var isAuthExpired = false

    private val _events = MutableSharedFlow<TrackingEvent>(extraBufferCapacity = 16)
    /** Tracking events emitted by sync operations (BatchSynced, BatchFailed). */
    val events: SharedFlow<TrackingEvent> = _events.asSharedFlow()

    companion object {
        /** Minimum pending count to trigger an immediate sync. */
        const val BATCH_THRESHOLD = 3
        /** Maximum points per batch submission. */
        const val MAX_BATCH_SIZE = 50
        /** Timer interval between periodic syncs (15 min per spec §7.2). */
        const val TIMER_INTERVAL_MS = 15L * 60 * 1000
        /** Initial retry backoff (30 seconds). */
        const val INITIAL_BACKOFF_MS = 30_000L
        /** Maximum retry backoff cap (10 minutes per spec §7.5). */
        const val MAX_BACKOFF_MS = 10L * 60 * 1000
    }

    /**
     * Start the sync worker for a trip.
     * Begins periodic timer and connectivity monitoring.
     */
    fun start(tripId: Long) {
        activeTripId = tripId
        currentBackoffMs = INITIAL_BACKOFF_MS
        isAuthExpired = false

        // Periodic timer trigger
        timerJob?.cancel()
        timerJob = scope.launch {
            while (isActive) {
                delay(TIMER_INTERVAL_MS)
                trySyncBatch()
            }
        }

        // Connectivity restored trigger
        connectivityJob?.cancel()
        connectivityJob = scope.launch {
            connectivityObserver.isOnline.collect { online ->
                if (online && activeTripId != null) {
                    // Network restored — flush immediately
                    trySyncBatch()
                }
            }
        }

        println("[BatchSyncWorker] Started for trip $tripId")
    }

    /**
     * Stop the sync worker. Performs a final flush attempt.
     */
    suspend fun stop() {
        println("[BatchSyncWorker] Stopping for trip $activeTripId")
        timerJob?.cancel()
        connectivityJob?.cancel()
        timerJob = null
        connectivityJob = null

        // Final flush
        trySyncBatch()
        activeTripId = null
    }

    /**
     * Force an immediate sync attempt. Called when:
     * - Pending count crosses threshold
     * - Connectivity is restored
     * - Timer fires
     * - Tracking stops (final flush)
     */
    suspend fun trySyncBatch() {
        val tripId = activeTripId ?: return
        if (isAuthExpired) return
        if (!connectivityObserver.isOnline.value) return

        // Prevent concurrent syncs
        if (syncJob?.isActive == true) return

        syncJob = scope.launch {
            try {
                syncPendingBatches(tripId)
            } catch (e: Exception) {
                println("[BatchSyncWorker] Sync error: ${e.message}")
            }
        }
        syncJob?.join()
    }

    /**
     * Sync all pending batches for the trip, in FIFO order.
     * Continues until no more pending points or a failure occurs.
     */
    @OptIn(ExperimentalUuidApi::class)
    private suspend fun syncPendingBatches(tripId: Long) {
        while (true) {
            val pending = locationBufferRepository.getPending(tripId, MAX_BATCH_SIZE)
            if (pending.isEmpty()) {
                // All synced — clean up and reset backoff
                locationBufferRepository.deleteSynced()
                currentBackoffMs = INITIAL_BACKOFF_MS
                return
            }

            val batchId = Uuid.random().toString()
            val points = pending.map { it.toLocationPoint() }
            val clientIds = pending.map { it.clientId }

            try {
                val result: BatchLogResult = locationRepository.batchLog(tripId, points)

                // Success — mark as synced
                locationBufferRepository.markSynced(clientIds)
                currentBackoffMs = INITIAL_BACKOFF_MS

                _events.emit(
                    TrackingEvent.BatchSynced(
                        timestamp = Clock.System.now(),
                        pointCount = result.accepted + result.duplicates,
                        batchId = batchId,
                    )
                )

                println("[BatchSyncWorker] Synced batch $batchId: ${result.accepted} accepted, ${result.duplicates} dupes")

            } catch (e: Exception) {
                val errorType = classifyError(e)

                if (errorType == BatchErrorType.AUTH_EXPIRED) {
                    isAuthExpired = true
                    println("[BatchSyncWorker] Auth expired — stopping retries")
                }

                locationBufferRepository.incrementSyncAttempts(clientIds)

                _events.emit(
                    TrackingEvent.BatchFailed(
                        timestamp = Clock.System.now(),
                        errorType = errorType,
                        retryCount = pending.firstOrNull()?.syncAttempts?.toInt()?.plus(1) ?: 1,
                        pointCount = pending.size,
                    )
                )

                println("[BatchSyncWorker] Batch $batchId failed: ${e.message} (backoff: ${currentBackoffMs}ms)")

                // Backoff before next attempt
                delay(currentBackoffMs)
                currentBackoffMs = min(currentBackoffMs * 2, MAX_BACKOFF_MS)
                return // Exit loop — will retry on next trigger
            }
        }
    }

    /**
     * Classify an exception into a [BatchErrorType] for structured logging.
     */
    private fun classifyError(e: Exception): BatchErrorType {
        val message = e.message?.lowercase() ?: ""
        return when {
            message.contains("401") || message.contains("unauthorized") ->
                BatchErrorType.AUTH_EXPIRED
            message.contains("4") && message.contains("00") ->
                BatchErrorType.CLIENT_ERROR
            message.contains("5") && message.contains("00") ->
                BatchErrorType.SERVER_ERROR
            else ->
                BatchErrorType.NETWORK_ERROR
        }
    }
}

/**
 * Convert a SQLDelight [BufferedLocationPoint] entity back to a domain [LocationPoint]
 * for submission to the backend.
 */
internal fun BufferedLocationPoint.toLocationPoint(): LocationPoint {
    return LocationPoint(
        clientId = clientId,
        latitude = latitude,
        longitude = longitude,
        accuracy = accuracy,
        timestamp = timestamp,
        speed = speed,
        bearing = bearing,
        altitude = altitude,
        provider = provider,
        batteryLevel = batteryLevel?.toInt(),
    )
}
