package com.axleops.mobile.di

import com.axleops.mobile.auth.session.SessionPersistence
import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.data.HttpClientFactory
import com.russhwolf.settings.Settings
import io.ktor.client.HttpClient
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import org.koin.core.qualifier.named
import org.koin.dsl.module

/**
 * Root Koin DI module for the AxleOps mobile app.
 *
 * Provides shared infrastructure bindings:
 * - [DataSourceConfig] — per-feature mock/real toggle
 * - [HttpClient] — configured Ktor client for backend communication
 * - SessionExpiredEvent — shared flow emitted on 401 responses
 * - [SessionPersistence] — stores/restores auth session to local Settings
 *
 * Feature-specific modules (AuthModule, DataSourceModule) are
 * registered separately and composed in the application entry point.
 */
val appModule = module {

    /**
     * Reactive per-feature data source configuration (mock vs real).
     * SettingsScreen writes to this; repositories read current value.
     * Toggling takes effect on next fetch (no restart required).
     */
    single { MutableStateFlow(DataSourceConfig.DEFAULT) }

    /** Snapshot accessor — modules that just need the current config. */
    single { get<MutableStateFlow<DataSourceConfig>>().value }

    /**
     * Shared event flow for session expiry (401 responses).
     * HttpClient emits to this; AppNavHost collects and triggers logout.
     * Breaks the circular dependency: HttpClient → AuthViewModel.
     */
    single(named("sessionExpired")) { MutableSharedFlow<Unit>(extraBufferCapacity = 1) }

    /** Shared Ktor HTTP client — wired with 401 interceptor. */
    single<HttpClient> {
        val sessionExpired = get<MutableSharedFlow<Unit>>(named("sessionExpired"))
        HttpClientFactory.create(
            onUnauthorized = { sessionExpired.tryEmit(Unit) },
        )
    }

    /**
     * Platform key-value storage for session persistence.
     * Uses multiplatform-settings no-arg constructor which resolves to:
     * - Android → SharedPreferences (default name)
     * - iOS → NSUserDefaults.standardUserDefaults
     */
    single { Settings() }

    /**
     * Session persistence — stores/restores/clears UserSession.
     * Used by AuthViewModel for cold-start restore and logout.
     * See: spec FR-050, plan §2
     */
    single { SessionPersistence(get()) }
}


