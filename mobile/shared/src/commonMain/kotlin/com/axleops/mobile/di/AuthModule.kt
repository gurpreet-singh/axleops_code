package com.axleops.mobile.di

import com.axleops.mobile.auth.repository.AuthRepository
import com.axleops.mobile.auth.repository.MockAuthRepository
import com.axleops.mobile.auth.repository.RealAuthRepository
import com.axleops.mobile.auth.session.SessionManager
import com.axleops.mobile.auth.viewmodel.AuthViewModel
import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.data.DataSourceMode
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

/**
 * Koin DI module for authentication bindings.
 *
 * Provides:
 * - [AuthRepository] → [RealAuthRepository] or [MockAuthRepository]
 *   based on [DataSourceConfig.authSource]
 * - [SessionManager] — foreground/background session re-validation
 * - [AuthViewModel] (scoped to Compose lifecycle)
 */
val authModule = module {

    /** Auth repository — toggleable between real and mock. */
    single<AuthRepository> {
        val config = get<DataSourceConfig>()
        when (config.authSource) {
            DataSourceMode.REAL -> RealAuthRepository(
                httpClient = get(),
                baseUrl = "", // Will be configured via build config or env
            )
            DataSourceMode.MOCK -> MockAuthRepository()
        }
    }

    /** Session manager — tracks background time, triggers re-validation. */
    single { SessionManager(authRepository = get(), sessionPersistence = get()) }

    /** Auth ViewModel — scoped to the compose lifecycle. */
    viewModel { AuthViewModel(authRepository = get(), sessionPersistence = get()) }
}
