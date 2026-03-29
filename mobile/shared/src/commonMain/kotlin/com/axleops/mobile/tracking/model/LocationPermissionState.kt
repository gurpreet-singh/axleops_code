package com.axleops.mobile.tracking.model

/**
 * The current state of location permissions as determined by the platform.
 *
 * This is a sealed class (not an enum) because some states carry
 * platform-specific semantics (e.g., [ReducedAccuracy] is iOS-only).
 *
 * Source: spec §4.1, §4.2, plan §5
 */
sealed class LocationPermissionState {

    /**
     * Permission has not been requested yet. This is the initial state
     * before the first trip departure triggers the permission flow.
     */
    data object NotDetermined : LocationPermissionState()

    /**
     * Foreground location permission ("When In Use") was granted.
     * Background location permission was NOT granted.
     *
     * Tracking works while the app is in the foreground.
     * Background tracking is limited — location updates may stop when
     * the driver switches apps or locks the screen.
     */
    data object ForegroundOnly : LocationPermissionState()

    /**
     * Both foreground and background location permissions are granted.
     * Full tracking capability — location updates continue when the
     * app is backgrounded.
     */
    data object ForegroundAndBackground : LocationPermissionState()

    /**
     * Location permission was denied by the driver.
     * On Android: the system dialog was dismissed with "Deny".
     * On iOS: the authorization status is `.denied`.
     *
     * The driver can still be asked again on the next departure
     * (unless permanently denied).
     */
    data object Denied : LocationPermissionState()

    /**
     * Location permission was permanently denied (Android-specific).
     *
     * On Android: `shouldShowRequestPermissionRationale()` returns false
     * after a prior denial, indicating the user selected "Don't ask again".
     * The only recovery path is directing the user to app Settings.
     *
     * On iOS: this state is not distinguishable from [Denied] at the API
     * level — iOS always uses [Denied] since Settings is the only recovery
     * path regardless.
     */
    data object PermanentlyDenied : LocationPermissionState()

    /**
     * iOS 14+ reduced accuracy mode — the user chose "Approximate Location".
     *
     * Tracking continues but with ~5km accuracy radius, significantly
     * degrading the fleet visibility value of the captured data.
     *
     * Android equivalent: not applicable (Android does not have a
     * reduced accuracy option in the permission dialog).
     */
    data object ReducedAccuracy : LocationPermissionState()

    // -- Computed properties --

    /** Whether foreground GPS capture is possible. */
    val canTrackForeground: Boolean
        get() = this is ForegroundOnly ||
            this is ForegroundAndBackground ||
            this is ReducedAccuracy

    /** Whether background GPS capture is possible (full or degraded). */
    val canTrackBackground: Boolean
        get() = this is ForegroundAndBackground

    /** Whether location permission has been explicitly denied. */
    val isDenied: Boolean
        get() = this is Denied || this is PermanentlyDenied

    /** Whether the user must go to Settings to change the permission. */
    val requiresSettingsNavigation: Boolean
        get() = this is PermanentlyDenied

    /** Whether accuracy is degraded (iOS approximate location). */
    val isReducedAccuracy: Boolean
        get() = this is ReducedAccuracy
}
