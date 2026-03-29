package com.axleops.mobile.platform

import com.axleops.mobile.tracking.model.LocationPermissionState
import kotlinx.cinterop.ExperimentalForeignApi
import platform.CoreLocation.CLAuthorizationStatus
import platform.CoreLocation.CLLocationManager
import platform.CoreLocation.kCLAuthorizationStatusAuthorizedAlways
import platform.CoreLocation.kCLAuthorizationStatusAuthorizedWhenInUse
import platform.CoreLocation.kCLAuthorizationStatusDenied
import platform.CoreLocation.kCLAuthorizationStatusNotDetermined
import platform.CoreLocation.kCLAuthorizationStatusRestricted
import platform.Foundation.NSURL
import platform.UIKit.UIApplication
import platform.UIKit.UIApplicationOpenSettingsURLString

/**
 * iOS implementation of [LocationPermissionHandler].
 *
 * Uses [CLLocationManager] to check and request location authorization.
 *
 * ## Authorization levels
 * - `requestWhenInUseAuthorization()` → foreground location
 * - `requestAlwaysAuthorization()` → background location
 * - `accuracyAuthorization` (iOS 14+) → full vs reduced accuracy
 *
 * ## Limitation (current)
 * Requesting authorization via [CLLocationManager] requires a delegate
 * to receive the callback. The current implementation creates a temporary
 * manager to check state. The actual request flow (with delegate callback)
 * will be wired through the `IOSLocationTracker` and the UI layer.
 *
 * Source: spec §4.2, plan §4
 */
actual class LocationPermissionHandler {

    @OptIn(ExperimentalForeignApi::class)
    actual suspend fun checkCurrentState(): LocationPermissionState {
        val status = CLLocationManager.authorizationStatus()
        return mapAuthorizationStatus(status)
    }

    actual suspend fun requestForegroundPermission(): LocationPermissionState {
        // NOTE: Actual authorization request requires a CLLocationManager instance
        // with a delegate to receive the authorization callback. The IOSLocationTracker
        // will handle the full flow. This method currently checks existing state.
        //
        // When the permission UI flow triggers this, it will:
        // 1. Create a CLLocationManager
        // 2. Call requestWhenInUseAuthorization()
        // 3. Wait for delegate callback
        // 4. Return the updated state
        return checkCurrentState()
    }

    actual suspend fun requestBackgroundPermission(): LocationPermissionState {
        // NOTE: Same as above. requestAlwaysAuthorization() requires delegate handling.
        // On iOS, the system may show a follow-up prompt automatically after WhenInUse
        // is granted and the app uses location in the background.
        return checkCurrentState()
    }

    actual fun openAppSettings() {
        val url = NSURL.URLWithString(UIApplicationOpenSettingsURLString) ?: return
        UIApplication.sharedApplication.openURL(url)
    }

    actual fun isDeviceLocationEnabled(): Boolean {
        return CLLocationManager.locationServicesEnabled()
    }

    // ---- Internal ----

    @OptIn(ExperimentalForeignApi::class)
    private fun mapAuthorizationStatus(status: CLAuthorizationStatus): LocationPermissionState {
        return when (status.toInt()) {
            kCLAuthorizationStatusNotDetermined.toInt() ->
                LocationPermissionState.NotDetermined
            kCLAuthorizationStatusDenied.toInt(),
            kCLAuthorizationStatusRestricted.toInt() ->
                LocationPermissionState.Denied
            kCLAuthorizationStatusAuthorizedWhenInUse.toInt() ->
                LocationPermissionState.ForegroundOnly
            kCLAuthorizationStatusAuthorizedAlways.toInt() ->
                LocationPermissionState.ForegroundAndBackground
            else ->
                LocationPermissionState.Denied
        }
    }
}
