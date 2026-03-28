package com.axleops.mobile.platform

import kotlinx.coroutines.flow.StateFlow

/**
 * Observes device network connectivity.
 *
 * Provides a reactive [isOnline] flow that emits `true` when the device
 * has a working network connection and `false` when offline.
 *
 * Platform implementations:
 * - Android: [ConnectivityManager] with [NetworkCallback]
 * - iOS: [NWPathMonitor]
 *
 * Foundation-owned. Consumed by:
 * - [ShellComponent] → drives the offline banner
 * - [UiStateHandler] → transitions screens to Offline state
 */
expect class ConnectivityObserver {

    /**
     * Reactive stream of online/offline state.
     * Emits immediately on subscription with the current state,
     * then emits on every network state change.
     */
    val isOnline: StateFlow<Boolean>

    /**
     * Start observing network changes.
     * Call once during app startup. Must be called before [isOnline] emits meaningful values.
     */
    fun startObserving()

    /**
     * Stop observing network changes and clean up resources.
     * Call during app teardown.
     */
    fun stopObserving()
}
