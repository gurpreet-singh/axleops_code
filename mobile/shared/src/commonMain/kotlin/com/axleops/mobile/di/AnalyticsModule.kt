package com.axleops.mobile.di

import com.axleops.mobile.analytics.AnalyticsService
import com.axleops.mobile.analytics.LocalAnalyticsService
import org.koin.dsl.module

/**
 * Koin DI module for analytics bindings.
 *
 * In debug builds, provides [LocalAnalyticsService] (console logging).
 * To switch to a production analytics provider, replace the binding
 * with Firebase, Mixpanel, or a custom implementation.
 */
val analyticsModule = module {

    /** Analytics service — local console logger by default. */
    single<AnalyticsService> { LocalAnalyticsService() }
}
