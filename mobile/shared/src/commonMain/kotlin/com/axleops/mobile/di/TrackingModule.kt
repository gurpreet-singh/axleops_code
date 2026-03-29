package com.axleops.mobile.di

import com.axleops.mobile.data.repository.MockLocationRepository
import com.axleops.mobile.domain.repository.LocationRepository
import com.axleops.mobile.tracking.LocationTracker
import com.axleops.mobile.tracking.MockLocationTracker
import com.axleops.mobile.tracking.TrackingManager
import org.koin.dsl.module

/**
 * Koin module for GPS tracking infrastructure.
 *
 * Binds TrackingManager, LocationTracker, LocationRepository.
 *
 * Source: plan §10
 */
val trackingModule = module {
    // LocationTracker: mock for now
    single<LocationTracker> { MockLocationTracker() }

    // LocationRepository: mock for now
    single<LocationRepository> { MockLocationRepository() }

    // TrackingManager
    single {
        TrackingManager(
            locationProvider = get(),
            locationRepository = get(),
        )
    }
}
