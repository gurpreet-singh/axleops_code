package com.axleops.mobile.di

import com.axleops.mobile.data.repository.MockLocationRepository
import com.axleops.mobile.domain.repository.LocationRepository
import com.axleops.mobile.tracking.LocationTracker
import com.axleops.mobile.tracking.MockLocationTracker
import com.axleops.mobile.tracking.TrackingManager
import com.axleops.mobile.tracking.TrackingStateMachine
import com.axleops.mobile.tracking.data.LocationBufferRepository
import com.axleops.mobile.tracking.sync.BatchSyncWorker
import org.koin.dsl.module

/**
 * Koin module for GPS tracking infrastructure.
 *
 * Binds all tracking subsystem components:
 * - [TrackingStateMachine] — pure state machine (singleton)
 * - [LocationTracker] — platform GPS abstraction (mock until T016/T017)
 * - [LocationRepository] — backend batch API (mock until LT-G1)
 * - [LocationBufferRepository] — SQLDelight offline buffer (always real)
 * - [BatchSyncWorker] — periodic sync with retry (singleton)
 * - [TrackingManager] — central orchestrator (singleton)
 *
 * Source: plan §7, §9, tasks.md T046
 */
val trackingModule = module {
    // State machine (singleton)
    single { TrackingStateMachine() }

    // LocationTracker: mock for now — will switch to platform actual in T016/T017
    single<LocationTracker> { MockLocationTracker() }

    // LocationRepository: mock for now — blocked on backend LT-G1
    single<LocationRepository> { MockLocationRepository() }

    // LocationBufferRepository: always real (SQLDelight, even in mock mode)
    single { LocationBufferRepository(database = get()) }

    // BatchSyncWorker: periodic sync with retry
    single {
        BatchSyncWorker(
            locationBufferRepository = get(),
            locationRepository = get(),
            connectivityObserver = get(),
        )
    }

    // TrackingManager: central orchestrator
    single {
        TrackingManager(
            stateMachine = get(),
            locationTracker = get(),
            locationBufferRepository = get(),
            locationPermissionHandler = get(),
            batchSyncWorker = get(),
        )
    }
}

