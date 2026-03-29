package com.axleops.mobile.platform

/**
 * Map view abstraction.
 *
 * Actual implementations:
 * - Android: Google Maps SDK (MapView)
 * - iOS: MapKit (MKMapView)
 *
 * Current: placeholder. Real map rendering will be implemented
 * with platform-specific composables using expect/actual.
 *
 * Source: plan §11
 */
interface MapViewProvider {
    /** Whether the map SDK is available on this platform. */
    val isAvailable: Boolean
}

/**
 * Mock [MapViewProvider] — map not available in mock mode.
 */
class MockMapViewProvider : MapViewProvider {
    override val isAvailable: Boolean = false
}
