package com.axleops.mobile.di

import com.axleops.mobile.platform.AppLifecycleObserver
import com.axleops.mobile.platform.ConnectivityObserver
import com.axleops.mobile.platform.SecureStorage
import com.axleops.mobile.platform.PermissionHandler
import org.koin.android.ext.koin.androidApplication
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.module

/**
 * Android platform module — provides platform services that need [Context].
 */
actual val platformModule = module {

    /** ConnectivityObserver backed by ConnectivityManager. */
    single { ConnectivityObserver(context = androidContext()) }

    /** SecureStorage backed by EncryptedSharedPreferences. */
    single { SecureStorage(context = androidContext()) }

    /** PermissionHandler backed by ContextCompat. */
    single { PermissionHandler(context = androidContext()) }

    /** AppLifecycleObserver backed by ProcessLifecycleOwner. */
    single { AppLifecycleObserver(application = androidApplication()) }
}
