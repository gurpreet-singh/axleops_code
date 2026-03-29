package com.axleops.mobile.platform

/**
 * Platform GPS location provider.
 *
 * Expect/actual for capturing a single GPS fix at the time of
 * a milestone transition.
 *
 * Actual implementations:
 * - Android: FusedLocationProviderClient (Play Services)
 * - iOS: CLLocationManager single-update request
 *
 * For the current mock-first phase, returns mock coordinates.
 * Real implementations will be created in §10 (GPS Tracking).
 *
 * Source: spec FR-050, plan §4
 */
data class GpsLocation(
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Double,
    val timestampMs: Long,
)

/**
 * Provider for obtaining the current GPS location.
 *
 * In mock mode: returns a fixed location (Mumbai: 19.0760, 72.8777).
 * In real mode: uses platform-specific APIs (Android FusedLocation / iOS CLLocation).
 */
interface LocationProvider {
    /**
     * Get the current GPS location.
     *
     * @return [GpsLocation] if available, null if GPS is disabled or unavailable.
     */
    suspend fun getCurrentLocation(): GpsLocation?
}

/**
 * Mock implementation for development and testing.
 *
 * Always returns a fixed location in Mumbai.
 * Switchable to real implementation when platform GPS is integrated.
 */
class MockLocationProvider : LocationProvider {
    override suspend fun getCurrentLocation(): GpsLocation =
        GpsLocation(
            latitude = 19.0760,
            longitude = 72.8777,
            accuracyMeters = 10.0,
            timestampMs = kotlinx.datetime.Clock.System.now().toEpochMilliseconds(),
        )
}
