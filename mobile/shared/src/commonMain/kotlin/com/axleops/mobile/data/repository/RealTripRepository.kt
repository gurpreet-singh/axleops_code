package com.axleops.mobile.data.repository

import com.axleops.mobile.data.dto.RejectTripRequestDto
import com.axleops.mobile.data.dto.TripDetailDto
import com.axleops.mobile.data.mapper.TripMapper
import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripFilter
import com.axleops.mobile.domain.repository.TripRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

/**
 * Real backend-backed [TripRepository].
 *
 * Calls:
 * - `GET /trips` -- list trips (with query params)
 * - `GET /trips/{id}` -- single trip detail
 *
 * Active trip methods use derived contracts that don't exist on
 * the backend yet. They stub to the closest available endpoints.
 *
 * Backend gaps:
 * - G1: `GET /trips/driver/active` does not exist. Falls back to
 *   `GET /trips?status=DISPATCHED&limit=1` as approximation.
 * - G2: `POST /trips/{id}/accept` and `/reject` do not exist.
 *   Real implementations throw UnsupportedOperationException.
 *   Toggle to MOCK in DataSourceConfig until backend is ready.
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

    override suspend fun getActiveTrip(): TripDetail? {
        // Backend gap G1: No driver-scoped active trip endpoint.
        // Best-effort: fetch the first dispatched trip for this driver.
        // This will be replaced with GET /trips/driver/active when available.
        return try {
            val dto = httpClient.get("$baseUrl/trips") {
                parameter("status", "DISPATCHED")
                parameter("limit", 1)
            }.body<List<TripDetailDto>>()
            dto.firstOrNull()?.let { TripMapper.toDomain(it) }
        } catch (_: Exception) {
            null
        }
    }

    override suspend fun acceptTrip(tripId: Long): TripDetail {
        // Backend gap G2: No accept endpoint exists.
        // When backend adds POST /trips/{id}/accept, replace this.
        val response = httpClient.post("$baseUrl/trips/$tripId/accept") {
            contentType(ContentType.Application.Json)
        }
        val dto = response.body<TripDetailDto>()
        return TripMapper.toDomain(dto)
    }

    override suspend fun rejectTrip(tripId: Long, reason: String): TripDetail {
        // Backend gap G2: No reject endpoint exists.
        // When backend adds POST /trips/{id}/reject, replace this.
        val response = httpClient.post("$baseUrl/trips/$tripId/reject") {
            contentType(ContentType.Application.Json)
            setBody(RejectTripRequestDto(reason))
        }
        val dto = response.body<TripDetailDto>()
        return TripMapper.toDomain(dto)
    }
}
