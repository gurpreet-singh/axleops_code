package com.axleops.mobile.tracking

import com.axleops.mobile.platform.GpsLocation
import kotlinx.cinterop.ExperimentalForeignApi
import kotlinx.cinterop.useContents
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import platform.CoreLocation.CLLocation
import platform.CoreLocation.CLLocationManager
import platform.CoreLocation.CLLocationManagerDelegateProtocol
import platform.CoreLocation.kCLLocationAccuracyBest
import platform.Foundation.NSError
import platform.Foundation.NSObject
import platform.darwin.NSObject as DarwinNSObject

/**
 * iOS [LocationTracker] using CLLocationManager.
 *
 * ## Architecture
 * - Uses [CLLocationManager] with `kCLLocationAccuracyBest` for GPS-grade precision
 * - `distanceFilter = 50.0` to avoid excessive battery drain on stationary devices
 * - Delegate callback maps CLLocation → [GpsLocation] data class
 * - Internal throttle ensures emissions respect the configured [intervalMs]
 *
 * ## Permission Requirement
 * Caller must ensure WhenInUse authorization is granted before calling [startTracking].
 * Always authorization is additionally required for background updates.
 *
 * ## Background
 * Background location updates require:
 * - `UIBackgroundModes: location` in Info.plist (T025)
 * - `allowsBackgroundLocationUpdates = true` (set in T026)
 * - `showsBackgroundLocationIndicator = true`
 *
 * Source: spec §3.1, §9.2, plan §2
 */
class IOSLocationTracker : LocationTracker {

    private val locationManager = CLLocationManager()

    private val _lastLocation = MutableStateFlow<GpsLocation?>(null)
    override val lastLocation: Flow<GpsLocation?> = _lastLocation.asStateFlow()

    private val _isTracking = MutableStateFlow(false)
    override val isTracking: StateFlow<Boolean> = _isTracking.asStateFlow()

    private var lastEmissionTimeMs: Long = 0
    private var configuredIntervalMs: Long = 5L * 60 * 1000

    private val delegate = LocationDelegate { location ->
        val now = platform.Foundation.NSDate.date().timeIntervalSince1970.toLong() * 1000

        // Throttle emissions to configured interval
        if (now - lastEmissionTimeMs >= configuredIntervalMs || lastEmissionTimeMs == 0L) {
            _lastLocation.value = location
            lastEmissionTimeMs = now
            println("[IOSLocationTracker] Location update: ${location.latitude}, ${location.longitude}")
        }
    }

    @OptIn(ExperimentalForeignApi::class)
    override fun startTracking(intervalMs: Long) {
        if (_isTracking.value) return
        configuredIntervalMs = intervalMs
        lastEmissionTimeMs = 0

        locationManager.delegate = delegate
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 50.0

        // Background location support (requires Info.plist entry)
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
        locationManager.showsBackgroundLocationIndicator = true

        locationManager.startUpdatingLocation()

        // T030: Significant location change monitoring for app relaunch after OS kill.
        // If iOS terminates the app, a significant location change (~500m) will
        // relaunch it, allowing tracking to resume.
        locationManager.startMonitoringSignificantLocationChanges()

        _isTracking.value = true
        println("[IOSLocationTracker] Started tracking (interval: ${intervalMs}ms)")
    }

    override fun stopTracking() {
        locationManager.stopUpdatingLocation()
        locationManager.stopMonitoringSignificantLocationChanges()
        locationManager.delegate = null
        _isTracking.value = false
        println("[IOSLocationTracker] Stopped tracking")
    }
}

/**
 * CLLocationManagerDelegate that forwards location updates to a callback.
 */
@OptIn(ExperimentalForeignApi::class)
private class LocationDelegate(
    private val onLocation: (GpsLocation) -> Unit,
) : NSObject(), CLLocationManagerDelegateProtocol {

    override fun locationManager(manager: CLLocationManager, didUpdateLocations: List<*>) {
        val clLocation = didUpdateLocations.lastOrNull() as? CLLocation ?: return

        val gpsLocation = clLocation.coordinate.useContents {
            GpsLocation(
                latitude = latitude,
                longitude = longitude,
                accuracyMeters = clLocation.horizontalAccuracy,
                timestampMs = (clLocation.timestamp.timeIntervalSince1970 * 1000).toLong(),
            )
        }
        onLocation(gpsLocation)
    }

    override fun locationManager(manager: CLLocationManager, didFailWithError: NSError) {
        println("[IOSLocationTracker] Location error: ${didFailWithError.localizedDescription}")
    }
}
