package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.EarningsSummary

/**
 * Repository interface for Earnings data access.
 *
 * Implementations:
 * - [MockEarningsRepository] — loads from JSON fixtures (v1 only)
 * - (Future) RealEarningsRepository — when backend API is available
 *
 * ⚠️ Backend gap: No earnings endpoint exists. This repository is
 * mock-only in v1. [DataSourceConfig.earningsSource] defaults to MOCK.
 */
interface EarningsRepository {

    /**
     * Fetch earnings summary for a driver in a given period.
     *
     * @param driverId The driver's contact ID.
     * @param period Period identifier, e.g., "2026-03".
     * @return Earnings summary, or null if no data found.
     */
    suspend fun getEarnings(driverId: Long, period: String): EarningsSummary?

    /**
     * Fetch available earning periods for a driver.
     *
     * @param driverId The driver's contact ID.
     * @return List of period strings, e.g., ["2026-03", "2026-02"].
     */
    suspend fun getAvailablePeriods(driverId: Long): List<String>
}
