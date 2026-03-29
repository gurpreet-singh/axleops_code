package com.axleops.mobile.di

import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.data.DataSourceMode
import com.axleops.mobile.data.repository.MockCheckpointRepository
import com.axleops.mobile.data.repository.MockEarningsRepository
import com.axleops.mobile.data.repository.MockMilestoneRepository
import com.axleops.mobile.data.repository.MockPodRepository
import com.axleops.mobile.data.repository.MockTripDocumentRepository
import com.axleops.mobile.data.repository.MockTripExceptionRepository
import com.axleops.mobile.data.repository.MockTripExpenseRepository
import com.axleops.mobile.data.repository.MockTripRepository
import com.axleops.mobile.data.repository.RealCheckpointRepository
import com.axleops.mobile.data.repository.RealMilestoneRepository
import com.axleops.mobile.data.repository.RealPodRepository
import com.axleops.mobile.data.repository.RealTripDocumentRepository
import com.axleops.mobile.data.repository.RealTripExceptionRepository
import com.axleops.mobile.data.repository.RealTripExpenseRepository
import com.axleops.mobile.data.repository.RealTripRepository
import com.axleops.mobile.domain.repository.CheckpointRepository
import com.axleops.mobile.domain.repository.EarningsRepository
import com.axleops.mobile.domain.repository.MilestoneRepository
import com.axleops.mobile.domain.repository.PodRepository
import com.axleops.mobile.domain.repository.TripDocumentRepository
import com.axleops.mobile.domain.repository.TripExceptionRepository
import com.axleops.mobile.domain.repository.TripExpenseRepository
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
 * config -- toggling a switch in Settings takes effect on next fetch.
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

    // ── Milestone Repository ─────────────────────────────────────────────
    factory<MilestoneRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.milestoneSource) {
            DataSourceMode.REAL -> RealMilestoneRepository(
                httpClient = get(),
                baseUrl = "",
            )
            DataSourceMode.MOCK -> MockMilestoneRepository()
        }
    }

    // ── Earnings Repository ──────────────────────────────────────────────
    // ⚠️ Mock-only in v1 -- no backend earnings API exists yet
    factory<EarningsRepository> {
        MockEarningsRepository()
    }

    // ── Document Repository ─────────────────────────────────────────────
    factory<TripDocumentRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.documentSource) {
            DataSourceMode.REAL -> RealTripDocumentRepository(httpClient = get(), baseUrl = "")
            DataSourceMode.MOCK -> MockTripDocumentRepository()
        }
    }

    // ── POD Repository ───────────────────────────────────────────────────
    factory<PodRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.podSource) {
            DataSourceMode.REAL -> RealPodRepository(httpClient = get(), baseUrl = "")
            DataSourceMode.MOCK -> MockPodRepository(tripRepository = get())
        }
    }

    // ── Expense Repository ──────────────────────────────────────────────
    factory<TripExpenseRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.expenseSource) {
            DataSourceMode.REAL -> RealTripExpenseRepository(httpClient = get(), baseUrl = "")
            DataSourceMode.MOCK -> MockTripExpenseRepository()
        }
    }

    // ── Exception Repository ────────────────────────────────────────────
    factory<TripExceptionRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.exceptionSource) {
            DataSourceMode.REAL -> RealTripExceptionRepository(httpClient = get(), baseUrl = "")
            DataSourceMode.MOCK -> MockTripExceptionRepository()
        }
    }

    // ── Checkpoint Repository ───────────────────────────────────────────
    factory<CheckpointRepository> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.checkpointSource) {
            DataSourceMode.REAL -> RealCheckpointRepository(httpClient = get(), baseUrl = "")
            DataSourceMode.MOCK -> MockCheckpointRepository()
        }
    }
}
