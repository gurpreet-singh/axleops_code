package com.axleops.mobile.di

import com.axleops.mobile.data.DataSourceConfig
import com.axleops.mobile.data.DataSourceMode
import com.axleops.mobile.upload.MockUploadService
import com.axleops.mobile.upload.RealUploadService
import com.axleops.mobile.upload.UploadService
import com.axleops.mobile.upload.UploadViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

/**
 * Koin DI module for upload service bindings.
 *
 * Toggles between [MockUploadService] and [RealUploadService]
 * based on [DataSourceConfig.uploadSource].
 *
 * Uses `factory` binding so toggling in Settings takes effect
 * on the next upload attempt (no restart required).
 */
val uploadModule = module {

    /** Upload service — toggleable between mock and real. */
    factory<UploadService> {
        val config = get<MutableStateFlow<DataSourceConfig>>().value
        when (config.uploadSource) {
            DataSourceMode.REAL -> RealUploadService(
                httpClient = get(),
                baseUrl = "", // Will be configured via build config
                tokenProvider = { null }, // Will be wired to session token
            )
            DataSourceMode.MOCK -> MockUploadService()
        }
    }

    /** Upload ViewModel — scoped to compose lifecycle. */
    viewModel { UploadViewModel(uploadService = get()) }
}
