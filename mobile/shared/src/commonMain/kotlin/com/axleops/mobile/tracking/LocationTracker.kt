package com.axleops.mobile.tracking

import com.axleops.mobile.platform.GpsLocation
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

/**
 * Platform location tracker abstraction.
 *
 * Provides a stream of GPS location updates at a configured interval.
 * Platform implementations manage the underlying GPS hardware lifecycle.
 *
 * Actual implementations:
 * - Android: ForegroundService + FusedLocationProviderClient (T016)
 * - iOS: CLLocationManager with background modes (T017)
 *
 * Source: spec §3.1, plan §2
 */
interface LocationTracker {
    /** Stream of location updates. Emits null initially and when GPS is unavailable. */
    val lastLocation: Flow<GpsLocation?>

    /** Whether the tracker is currently capturing locations. */
    val isTracking: StateFlow<Boolean>

    /**
     * Start capturing location updates at the given interval.
     *
     * @param intervalMs Time between location captures in milliseconds.
     *   Default: 300_000ms (5 minutes) per spec §3.2.
     */
    fun startTracking(intervalMs: Long = 5 * 60 * 1000L)

    /** Stop capturing location updates and release GPS hardware. */
    fun stopTracking()
}

/**
 * Mock [LocationTracker] — emits periodic synthetic locations.
 *
 * In mock mode, emits a fixed Mumbai location at the configured interval.
 * The location shifts slightly on each emission to simulate movement.
 *
 * Used when `DataSourceConfig.useRealLocation` is false.
 */
class MockLocationTracker : LocationTracker {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var trackingJob: Job? = null
    private var emissionCount = 0

    private val _lastLocation = MutableStateFlow<GpsLocation?>(null)
    override val lastLocation: Flow<GpsLocation?> = _lastLocation.asStateFlow()

    private val _isTracking = MutableStateFlow(false)
    override val isTracking: StateFlow<Boolean> = _isTracking.asStateFlow()

    override fun startTracking(intervalMs: Long) {
        if (trackingJob?.isActive == true) return
        _isTracking.value = true
        emissionCount = 0

        trackingJob = scope.launch {
            while (isActive) {
                // Emit a slightly shifting location to simulate movement
                val drift = emissionCount * 0.001
                _lastLocation.value = GpsLocation(
                    latitude = 19.0760 + drift,
                    longitude = 72.8777 + drift,
                    accuracyMeters = 10.0,
                    timestampMs = Clock.System.now().toEpochMilliseconds(),
                )
                emissionCount++
                println("[MockLocationTracker] Emitted location #$emissionCount")
                delay(intervalMs)
            }
        }
    }

    override fun stopTracking() {
        trackingJob?.cancel()
        trackingJob = null
        _isTracking.value = false
        println("[MockLocationTracker] Stopped tracking after $emissionCount emissions")
    }
}

