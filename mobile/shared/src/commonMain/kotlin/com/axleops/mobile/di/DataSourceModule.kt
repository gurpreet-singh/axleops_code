package com.axleops.mobile.di

import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.data.DataSourceMode
import com.axleops.mobile.data.repository.MockEarningsRepository
import com.axleops.mobile.data.repository.MockTripRepository
import com.axleops.mobile.data.repository.RealTripRepository
import com.axleops.mobile.domain.repository.EarningsRepository
import com.axleops.mobile.domain.repository.TripRepository
import kotlinx.coroutines.flow.MutableStateFlow
import org.koin.dsl.module

/**
 * Koin DI module for data source bindings.
 *
 * Uses the reactive [MutableStateFlow]<[DataSourceConfig]> to decide
 * whether each feature's repository is backed by the real backend API
 * or by local mock JSON fixtures.
 *
 * **factory** bindings are used so that each access re-reads the current
 * config — toggling a switch in Settings takes effect on next fetch.
 */
val dataSourceModule = module {

    // ── Trip Repository ──────────────────────────────────────────────────
    factory<TripRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.tripSource) {
            DataSourceMode.REAL -> RealTripRepository(
                httpClient = get(),
                baseUrl = "", // Will be configured via build config
            )
            DataSourceMode.MOCK -> MockTripRepository()
        }
    }

    // ── Earnings Repository ──────────────────────────────────────────────
    // ⚠️ Mock-only in v1 — no backend earnings API exists yet
    factory<EarningsRepository> {
        MockEarningsRepository()
    }
}
