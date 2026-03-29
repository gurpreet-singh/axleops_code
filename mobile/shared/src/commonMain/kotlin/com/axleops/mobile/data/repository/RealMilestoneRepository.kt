package com.axleops.mobile.data.repository

import com.axleops.mobile.data.dto.TransitionRequestDto
import com.axleops.mobile.data.dto.TripDetailDto
import com.axleops.mobile.data.mapper.TripMapper
import com.axleops.mobile.domain.model.Milestone
import com.axleops.mobile.domain.model.TransitionRequest
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.repository.MilestoneRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType

/**
 * Real backend-backed [MilestoneRepository].
 *
 * Calls:
 * - `GET /trips/{id}/milestones` -- milestone list
 * - `POST /trips/{id}/transition` -- state transition
 *
 * Backend gaps:
 * - G3: Milestone endpoint does not exist yet.
 *   Falls back to embedded milestones from trip detail.
 * - G2: Transition endpoint does not exist yet.
 *   Real implementation calls the derived contract shape.
 */
class RealMilestoneRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : MilestoneRepository {

    override suspend fun getMilestones(tripId: Long): List<Milestone> {
        // Backend gap G3: No dedicated milestone endpoint.
        // Best-effort: fetch from trip detail and extract milestones.
        return try {
            val dto = httpClient.get("$baseUrl/trips/$tripId").body<TripDetailDto>()
            TripMapper.toDomain(dto).milestones
        } catch (_: Exception) {
            emptyList()
        }
    }

    override suspend fun transition(tripId: Long, request: TransitionRequest): TripDetail {
        // Backend gap G2: No transition endpoint exists.
        // When backend adds POST /trips/{id}/transition, this will work.
        val response = httpClient.post("$baseUrl/trips/$tripId/transition") {
            contentType(ContentType.Application.Json)
            setBody(
                TransitionRequestDto(
                    event = request.event,
                    timestamp = request.timestamp,
                    latitude = request.latitude,
                    longitude = request.longitude,
                    gpsAccuracy = request.gpsAccuracy,
                    capturedData = request.capturedData,
                    evidenceIds = request.evidenceIds,
                    notes = request.notes,
                )
            )
        }
        val dto = response.body<TripDetailDto>()
        return TripMapper.toDomain(dto)
    }
}
