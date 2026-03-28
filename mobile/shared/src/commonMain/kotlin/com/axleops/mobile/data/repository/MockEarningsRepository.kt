package com.axleops.mobile.data.repository

import com.axleops.mobile.data.MockFixtureLoader
import com.axleops.mobile.domain.model.EarningsSummary
import com.axleops.mobile.domain.repository.EarningsRepository

/**
 * Mock [EarningsRepository] backed by local JSON fixtures.
 *
 * Loads earnings data from:
 *   `composeResources/files/mocks/earnings/driver-earnings.json`
 *
 * Since the backend has no earnings endpoint, this is the only
 * implementation in v1. When the backend adds an earnings API,
 * a `RealEarningsRepository` will be created and `DataSourceConfig.earningsSource`
 * will be switched to REAL.
 */
class MockEarningsRepository(
    private val fixturePath: String = "earnings/driver-earnings.json",
) : EarningsRepository {

    override suspend fun getEarnings(driverId: Long, period: String): EarningsSummary? {
        val summary = MockFixtureLoader.load(
            fixturePath,
            EarningsSummary.serializer(),
        )
        // Return the fixture data if the period matches, otherwise null
        return if (summary.period == period) summary else null
    }

    override suspend fun getAvailablePeriods(driverId: Long): List<String> {
        val summary = MockFixtureLoader.load(
            fixturePath,
            EarningsSummary.serializer(),
        )
        return listOf(summary.period)
    }
}
