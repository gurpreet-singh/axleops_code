package com.axleops.mobile.data

/**
 * Determines how a feature's data layer resolves its repository implementation.
 */
enum class DataSourceMode {
    /** Use the real backend API via Ktor HTTP client. */
    REAL,

    /** Use local mock JSON fixtures from composeResources/files/mocks/. */
    MOCK
}

/**
 * Per-feature data source configuration.
 *
 * Each feature's data source can be independently toggled between
 * [DataSourceMode.REAL] and [DataSourceMode.MOCK]. This supports
 * incremental backend integration: features start on MOCK and
 * switch to REAL as backend endpoints become available.
 *
 * In production builds, all features should be set to [DataSourceMode.REAL].
 * In debug/QA builds, individual features can be toggled at runtime
 * via the Settings debug panel.
 */
data class DataSourceConfig(
    val authSource: DataSourceMode = DataSourceMode.REAL,
    val tripSource: DataSourceMode = DataSourceMode.REAL,
    val vehicleSource: DataSourceMode = DataSourceMode.REAL,
    val contactSource: DataSourceMode = DataSourceMode.REAL,
    val uploadSource: DataSourceMode = DataSourceMode.MOCK,
    val milestoneSource: DataSourceMode = DataSourceMode.MOCK,
    val podSource: DataSourceMode = DataSourceMode.MOCK,
    val earningsSource: DataSourceMode = DataSourceMode.MOCK,
) {
    companion object {
        /** Default config: real APIs where available, mock for gaps. */
        val DEFAULT = DataSourceConfig()

        /** All-mock config for fully offline QA testing. */
        val ALL_MOCK = DataSourceConfig(
            authSource = DataSourceMode.MOCK,
            tripSource = DataSourceMode.MOCK,
            vehicleSource = DataSourceMode.MOCK,
            contactSource = DataSourceMode.MOCK,
            uploadSource = DataSourceMode.MOCK,
            milestoneSource = DataSourceMode.MOCK,
            podSource = DataSourceMode.MOCK,
            earningsSource = DataSourceMode.MOCK,
        )
    }
}
