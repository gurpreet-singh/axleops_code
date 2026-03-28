package com.axleops.mobile.platform

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * iOS [ConnectivityObserver] — baseline implementation.
 *
 * Defaults to online=true. The Compose layer checks connectivity before
 * network requests and updates this state via the Ktor client's error handling.
 *
 * For production-grade continuous monitoring, implement NWPathMonitor via
 * a Swift helper class exposed to Kotlin via @objc bridging.
 *
 * The expect/actual contract allows swapping this for a real implementation
 * without changing any consumer code.
 */
actual class ConnectivityObserver {

    private val _isOnline = MutableStateFlow(true)
    actual val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

    actual fun startObserving() {
        // Baseline: assume online. Real monitoring via Swift NWPathMonitor bridge
        // will be added in a platform-integration task.
        _isOnline.value = true
    }

    actual fun stopObserving() {
        // No-op for baseline implementation
    }

    /**
     * Called by the shared network layer when a request fails due to
     * connectivity issues, or succeeds after a failure.
     */
    fun updateConnectivity(online: Boolean) {
        _isOnline.value = online
    }
}
