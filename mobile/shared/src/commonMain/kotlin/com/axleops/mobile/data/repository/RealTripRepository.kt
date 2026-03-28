package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripFilter
import com.axleops.mobile.domain.repository.TripRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter

/**
 * Real backend-backed [TripRepository].
 *
 * Calls:
 * - `GET /trips` — list trips (with query params)
 * - `GET /trips/{id}` — single trip detail
 *
 * ⚠️ Backend gap: The `driverId` query parameter is not yet supported
 * by the backend. When this is added, remove the mock fallback for
 * driver-scoped queries.
 */
class RealTripRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : TripRepository {

    override suspend fun getTrips(filter: TripFilter): List<Trip> {
        return httpClient.get("$baseUrl/trips") {
            filter.driverId?.let { parameter("driverId", it) }
            filter.branchId?.let { parameter("branchId", it) }
            filter.status?.let { parameter("status", it.name) }
            parameter("limit", filter.limit)
            parameter("offset", filter.offset)
        }.body()
    }

    override suspend fun getTrip(id: Long): Trip? {
        return try {
            httpClient.get("$baseUrl/trips/$id").body<Trip>()
        } catch (_: Exception) {
            null
        }
    }
}
