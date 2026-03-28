package com.axleops.mobile.platform

import platform.Foundation.NSNotification
import platform.Foundation.NSNotificationCenter
import platform.Foundation.NSOperationQueue
import platform.UIKit.UIApplicationDidBecomeActiveNotification
import platform.UIKit.UIApplicationDidEnterBackgroundNotification
import platform.darwin.NSObjectProtocol

/**
 * iOS [AppLifecycleObserver] using [NSNotificationCenter].
 *
 * Observes UIApplicationDidBecomeActive and UIApplicationDidEnterBackground
 * notifications to detect foreground/background transitions.
 */
actual class AppLifecycleObserver {

    private var foregroundToken: NSObjectProtocol? = null
    private var backgroundToken: NSObjectProtocol? = null

    actual fun startObserving(
        onForeground: () -> Unit,
        onBackground: () -> Unit,
    ) {
        val center = NSNotificationCenter.defaultCenter

        foregroundToken = center.addObserverForName(
            name = UIApplicationDidBecomeActiveNotification,
            `object` = null,
            queue = NSOperationQueue.mainQueue,
        ) { _: NSNotification? ->
            onForeground()
        }

        backgroundToken = center.addObserverForName(
            name = UIApplicationDidEnterBackgroundNotification,
            `object` = null,
            queue = NSOperationQueue.mainQueue,
        ) { _: NSNotification? ->
            onBackground()
        }
    }

    actual fun stopObserving() {
        val center = NSNotificationCenter.defaultCenter
        foregroundToken?.let { center.removeObserver(it) }
        backgroundToken?.let { center.removeObserver(it) }
        foregroundToken = null
        backgroundToken = null
    }
}
