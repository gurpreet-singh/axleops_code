package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.repository.BatchLogResult
import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository

/**
 * Mock [LocationRepository] — logs GPS points to console.
 *
 * Returns a successful [BatchLogResult] with all points accepted.
 * Used when `DataSourceConfig.useRealLocation` is false.
 */
class MockLocationRepository : LocationRepository {

    override suspend fun batchLog(tripId: Long, points: List<LocationPoint>): BatchLogResult {
        println("[MockLocationRepository] Batch log ${points.size} points for trip $tripId")
        return BatchLogResult(accepted = points.size, duplicates = 0)
    }
}

