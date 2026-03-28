package com.axleops.mobile.di

import com.axleops.mobile.platform.AppLifecycleObserver
import com.axleops.mobile.platform.ConnectivityObserver
import com.axleops.mobile.platform.SecureStorage
import com.axleops.mobile.platform.PermissionHandler
import org.koin.dsl.module

/**
 * iOS platform module — provides platform services with no-args constructors.
 */
actual val platformModule = module {

    /** ConnectivityObserver — baseline (default online). */
    single { ConnectivityObserver() }

    /** SecureStorage backed by NSUserDefaults. */
    single { SecureStorage() }

    /** PermissionHandler — stub. */
    single { PermissionHandler() }

    /** AppLifecycleObserver backed by NSNotificationCenter. */
    single { AppLifecycleObserver() }
}
