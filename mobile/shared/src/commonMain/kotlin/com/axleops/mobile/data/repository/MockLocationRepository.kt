package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository

/**
 * Mock [LocationRepository] — logs GPS points to console.
 */
class MockLocationRepository : LocationRepository {

    override suspend fun batchLog(tripId: Long, points: List<LocationPoint>) {
        println("[MockLocationRepository] Batch log ${points.size} points for trip $tripId")
    }
}
