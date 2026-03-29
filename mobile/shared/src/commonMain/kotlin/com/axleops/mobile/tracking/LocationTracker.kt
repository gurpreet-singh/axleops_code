package com.axleops.mobile.tracking

import com.axleops.mobile.platform.GpsLocation
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.datetime.Clock

/**
 * Platform location tracker abstraction.
 *
 * Actual implementations:
 * - Android: Foreground service + FusedLocationProviderClient
 * - iOS: CLLocationManager with background modes
 *
 * Current: mock implementation for development.
 *
 * Source: spec FR-110, plan §10
 */
interface LocationTracker {
    val lastLocation: Flow<GpsLocation?>
    fun startTracking()
    fun stopTracking()
}

/**
 * Mock [LocationTracker] — emits a fixed location.
 */
class MockLocationTracker : LocationTracker {
    private val _lastLocation = MutableStateFlow<GpsLocation?>(
        GpsLocation(
            latitude = 19.0760,
            longitude = 72.8777,
            accuracyMeters = 10.0,
            timestampMs = Clock.System.now().toEpochMilliseconds(),
        )
    )
    override val lastLocation: Flow<GpsLocation?> = _lastLocation.asStateFlow()

    override fun startTracking() { /* no-op in mock */ }
    override fun stopTracking() { /* no-op in mock */ }
}
