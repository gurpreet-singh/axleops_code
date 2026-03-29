package com.axleops.mobile.di

import org.koin.core.context.startKoin

/**
 * iOS entry point for Koin dependency injection.
 *
 * Called from the iOS app delegate (iOSApp.swift) on launch.
 * Registers the same modules as the Android AxleOpsApplication.
 */
fun initKoin() {
    startKoin {
        modules(appModule, analyticsModule, authModule, dataSourceModule, platformModule, tripModule, trackingModule, uploadModule)
    }
}
