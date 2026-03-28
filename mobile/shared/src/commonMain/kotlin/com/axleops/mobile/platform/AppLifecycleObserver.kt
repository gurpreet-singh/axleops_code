package com.axleops.mobile.platform

/**
 * Observes app lifecycle transitions (foreground ↔ background).
 *
 * Platform implementations:
 * - Android: [ProcessLifecycleOwner] via AndroidX Lifecycle
 * - iOS: [NSNotificationCenter] willEnterForeground / didEnterBackground
 *
 * Foundation-owned. Consumed by [SessionManager] to trigger
 * silent session re-validation after long background periods.
 */
expect class AppLifecycleObserver {

    /**
     * Start observing lifecycle transitions.
     *
     * @param onForeground Called when the app moves to foreground.
     * @param onBackground Called when the app moves to background.
     */
    fun startObserving(
        onForeground: () -> Unit,
        onBackground: () -> Unit,
    )

    /**
     * Stop observing lifecycle transitions and clean up resources.
     */
    fun stopObserving()
}
