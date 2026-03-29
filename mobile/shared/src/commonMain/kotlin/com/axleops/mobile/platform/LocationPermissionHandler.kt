package com.axleops.mobile.platform

import com.axleops.mobile.tracking.model.LocationPermissionState

/**
 * Platform-specific handler for location permission requests.
 *
 * This is a **separate** abstraction from [PermissionHandler] (camera/gallery)
 * because location permissions have a fundamentally different flow:
 * 1. Multi-step: foreground first, then background (Android 10+, iOS)
 * 2. Rich return type: [LocationPermissionState] sealed class, not Boolean
 * 3. Platform-divergent: Android has "Don't ask again", iOS has "Approximate"
 *
 * Platform implementations:
 * - Android: [ActivityCompat.requestPermissions] with shouldShowRationale detection
 * - iOS: [CLLocationManager.requestWhenInUseAuthorization] / [requestAlwaysAuthorization]
 *
 * Source: spec §4.1, §4.2, plan §4
 */
expect class LocationPermissionHandler {

    /**
     * Query the current location permission state without triggering any dialog.
     *
     * @return Current [LocationPermissionState] reflecting OS permission records.
     */
    suspend fun checkCurrentState(): LocationPermissionState

    /**
     * Request foreground ("When In Use") location permission.
     *
     * On Android: requests `ACCESS_FINE_LOCATION`.
     * On iOS: calls `requestWhenInUseAuthorization()`.
     *
     * @return Updated [LocationPermissionState] after the user responds.
     */
    suspend fun requestForegroundPermission(): LocationPermissionState

    /**
     * Request background ("Always") location permission.
     *
     * On Android: requests `ACCESS_BACKGROUND_LOCATION` (requires foreground first).
     * On iOS: calls `requestAlwaysAuthorization()`.
     *
     * @return Updated [LocationPermissionState] after the user responds.
     */
    suspend fun requestBackgroundPermission(): LocationPermissionState

    /**
     * Open the system Settings page for this app.
     * Used when permission is permanently denied (Android) or denied (iOS),
     * and the only recovery path is manual Settings navigation.
     */
    fun openAppSettings()

    /**
     * Check whether the device's location services (GPS) are enabled.
     *
     * @return true if at least one location provider is enabled.
     */
    fun isDeviceLocationEnabled(): Boolean
}
