package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository
import io.ktor.client.HttpClient

/**
 * Real [LocationRepository] — POSTs GPS batch to `/location/log`.
 *
 * Backend gap: Location logging API may not exist yet.
 */
class RealLocationRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : LocationRepository {

    override suspend fun batchLog(tripId: Long, points: List<LocationPoint>) {
        // Backend gap: Location logging API not yet available
        throw UnsupportedOperationException("Backend location logging API not available")
    }
}
