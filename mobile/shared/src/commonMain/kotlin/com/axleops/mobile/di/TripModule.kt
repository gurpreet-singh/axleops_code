package com.axleops.mobile.di

import com.axleops.mobile.platform.LocationProvider
import com.axleops.mobile.platform.MockLocationProvider
import com.axleops.mobile.trip.usecase.AcceptTripUseCase
import com.axleops.mobile.trip.usecase.GetActiveTripUseCase
import com.axleops.mobile.trip.usecase.RejectTripUseCase
import com.axleops.mobile.trip.usecase.TransitionMilestoneUseCase
import org.koin.dsl.module

/**
 * Koin DI module for Active Trip feature.
 *
 * Provides use case bindings consumed by [ActiveTripComponent].
 * Repository dependency ([TripRepository]) is provided by [dataSourceModule].
 */
val tripModule = module {

    // ── Use Cases ────────────────────────────────────────────────────────

    factory { GetActiveTripUseCase(tripRepository = get()) }
    factory { AcceptTripUseCase(tripRepository = get()) }
    factory { RejectTripUseCase(tripRepository = get()) }
    factory { TransitionMilestoneUseCase(milestoneRepository = get()) }

    // ── Platform Services ────────────────────────────────────────────────

    factory<LocationProvider> { MockLocationProvider() }
}

