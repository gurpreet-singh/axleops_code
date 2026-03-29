package com.axleops.mobile

import android.app.Application
import com.axleops.mobile.di.analyticsModule
import com.axleops.mobile.di.appModule
import com.axleops.mobile.di.authModule
import com.axleops.mobile.di.dataSourceModule
import com.axleops.mobile.di.platformModule
import com.axleops.mobile.di.tripModule
import com.axleops.mobile.di.uploadModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

/**
 * AxleOps Mobile Application class.
 *
 * Initializes Koin DI with all modules:
 * - [appModule] — shared infrastructure (DataSourceConfig, HttpClient)
 * - [authModule] — auth repository + ViewModel
 * - [dataSourceModule] — feature repositories (Trip, Earnings)
 * - [platformModule] — platform-specific services (ConnectivityObserver, SecureStorage)
 */
class AxleOpsApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger(Level.DEBUG)
            androidContext(this@AxleOpsApplication)
            modules(
                appModule,
                analyticsModule,
                authModule,
                dataSourceModule,
                platformModule,
                tripModule,
                uploadModule,
            )
        }
    }
}
