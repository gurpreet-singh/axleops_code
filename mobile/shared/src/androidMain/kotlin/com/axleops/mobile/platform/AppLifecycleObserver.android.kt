package com.axleops.mobile.platform

import android.app.Application
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner

/**
 * Android [AppLifecycleObserver] using [ProcessLifecycleOwner].
 *
 * Observes the application-level lifecycle (not Activity-level) to detect
 * when the entire app moves to background vs foreground.
 */
actual class AppLifecycleObserver(
    private val application: Application,
) {
    private var observer: DefaultLifecycleObserver? = null

    actual fun startObserving(
        onForeground: () -> Unit,
        onBackground: () -> Unit,
    ) {
        val lifecycleObserver = object : DefaultLifecycleObserver {
            override fun onStart(owner: LifecycleOwner) {
                onForeground()
            }

            override fun onStop(owner: LifecycleOwner) {
                onBackground()
            }
        }
        observer = lifecycleObserver

        // ProcessLifecycleOwner must be accessed on the main thread
        ProcessLifecycleOwner.get().lifecycle.addObserver(lifecycleObserver)
    }

    actual fun stopObserving() {
        observer?.let { obs ->
            ProcessLifecycleOwner.get().lifecycle.removeObserver(obs)
        }
        observer = null
    }
}
