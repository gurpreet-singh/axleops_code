package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.repository.BatchLogResult
import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.serialization.Serializable

/**
 * Real [LocationRepository] — POSTs GPS batch to `/trips/{id}/location/batch`.
 *
 * ## Endpoint Contract (derived-contracts.md)
 * ```
 * POST /trips/{tripId}/location/batch
 * Content-Type: application/json
 * Authorization: Bearer {token}
 *
 * Body: { "points": [ { clientId, latitude, longitude, ... } ] }
 * Response: 202 Accepted { "accepted": N, "duplicates": M }
 * ```
 *
 * ## Backend Gap (LT-G1)
 * The backend endpoint may not yet be deployed. This implementation is
 * ready to work as soon as the backend ships. In the meantime, the app
 * uses `MockLocationRepository` via `DataSourceConfig`.
 *
 * Source: spec §8.2, derived-contracts.md
 */
class RealLocationRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : LocationRepository {

    override suspend fun batchLog(tripId: Long, points: List<LocationPoint>): BatchLogResult {
        val requestBody = BatchLocationRequest(
            points = points.map { point ->
                LocationPointDto(
                    clientId = point.clientId,
                    latitude = point.latitude,
                    longitude = point.longitude,
                    accuracy = point.accuracy,
                    timestamp = point.timestamp,
                    speed = point.speed ?: 0.0,
                    bearing = point.bearing ?: 0.0,
                    altitude = point.altitude ?: 0.0,
                    provider = point.provider ?: "unknown",
                    batteryLevel = point.batteryLevel ?: -1,
                )
            }
        )

        val response = httpClient.post("$baseUrl/trips/$tripId/location/batch") {
            contentType(ContentType.Application.Json)
            setBody(requestBody)
        }

        val responseBody: BatchLocationResponse = response.body()
        return BatchLogResult(
            accepted = responseBody.accepted,
            duplicates = responseBody.duplicates,
        )
    }
}

@Serializable
private data class BatchLocationRequest(
    val points: List<LocationPointDto>,
)

@Serializable
private data class LocationPointDto(
    val clientId: String,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double,
    val timestamp: String,
    val speed: Double,
    val bearing: Double,
    val altitude: Double,
    val provider: String,
    val batteryLevel: Int,
)

@Serializable
private data class BatchLocationResponse(
    val accepted: Int,
    val duplicates: Int,
)
