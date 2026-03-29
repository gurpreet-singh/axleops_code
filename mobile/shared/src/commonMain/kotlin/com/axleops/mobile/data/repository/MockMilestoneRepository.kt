package com.axleops.mobile.data.repository

import com.axleops.mobile.data.MockFixtureLoader
import com.axleops.mobile.data.dto.TripDetailDto
import com.axleops.mobile.data.mapper.TripMapper
import com.axleops.mobile.domain.model.Milestone
import com.axleops.mobile.domain.model.MilestoneStatus
import com.axleops.mobile.domain.model.MilestoneType
import com.axleops.mobile.domain.model.TransitionRequest
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.domain.repository.MilestoneRepository
import com.axleops.mobile.trip.state.TripStateMachine
import kotlinx.serialization.builtins.ListSerializer

/**
 * Mock [MilestoneRepository] backed by local JSON fixtures.
 *
 * Implements an in-memory state machine that:
 * 1. Loads milestones from the active trip fixture
 * 2. Validates transitions using [TripStateMachine]
 * 3. Advances milestone statuses and trip status in-memory
 *
 * The mock state progresses through the full lifecycle, enabling
 * QA to test every milestone transition without a backend.
 */
class MockMilestoneRepository(
    private val fixturePath: String = "trip/active-trip-dispatched.json",
) : MilestoneRepository {

    /** In-memory milestone state. Loaded lazily from fixture. */
    private var milestones: MutableList<Milestone>? = null
    private var currentTripStatus: TripStatus = TripStatus.DISPATCHED

    override suspend fun getMilestones(tripId: Long): List<Milestone> {
        return getOrLoadMilestones()
    }

    override suspend fun transition(tripId: Long, request: TransitionRequest): TripDetail {
        val milestoneList = getOrLoadMilestones().toMutableList()

        // Find the milestone type matching the transition event
        val milestoneType = MilestoneType.entries.firstOrNull { it.name == request.event }
            ?: throw IllegalArgumentException("Unknown transition event: ${request.event}")

        // Find the target milestone
        val targetIndex = milestoneList.indexOfFirst { it.type == milestoneType }
        require(targetIndex >= 0) { "Milestone not found for event: ${request.event}" }

        // Compute the new trip status from the state machine
        val targetMilestone = milestoneList[targetIndex]
        require(targetMilestone.status == MilestoneStatus.CURRENT) {
            "Cannot transition milestone ${milestoneType.name}: status is ${targetMilestone.status}"
        }

        // Update the completed milestone
        milestoneList[targetIndex] = targetMilestone.copy(
            status = MilestoneStatus.COMPLETED,
            completedAt = request.timestamp,
            latitude = request.latitude,
            longitude = request.longitude,
            gpsAccuracy = request.gpsAccuracy,
            capturedData = request.capturedData,
            evidenceIds = request.evidenceIds,
        )

        // Advance the next milestone to CURRENT (if any)
        if (targetIndex + 1 < milestoneList.size) {
            milestoneList[targetIndex + 1] = milestoneList[targetIndex + 1].copy(
                status = MilestoneStatus.CURRENT,
            )
        }

        // Update trip status based on the completed milestone type
        currentTripStatus = milestoneTypeToTripStatus(milestoneType)

        // Save in-memory state
        milestones = milestoneList

        // Return updated trip detail
        val dto = loadFixture()
        val tripDetail = dto?.let { TripMapper.toDomain(it) } ?: throw IllegalStateException("No fixture")
        return tripDetail.copy(
            status = currentTripStatus,
            milestones = milestoneList,
        )
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private suspend fun getOrLoadMilestones(): List<Milestone> {
        milestones?.let { return it }

        val dto = loadFixture() ?: return emptyList()
        val tripDetail = TripMapper.toDomain(dto)
        currentTripStatus = tripDetail.status
        val loaded = tripDetail.milestones.toMutableList()
        milestones = loaded
        return loaded
    }

    private suspend fun loadFixture(): TripDetailDto? {
        return try {
            val dtos = MockFixtureLoader.load(
                fixturePath,
                ListSerializer(TripDetailDto.serializer()),
            )
            dtos.firstOrNull()
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Map a completed milestone type to the resulting trip status.
     */
    private fun milestoneTypeToTripStatus(type: MilestoneType): TripStatus = when (type) {
        MilestoneType.DISPATCH -> TripStatus.DISPATCHED
        MilestoneType.ACCEPT -> TripStatus.ACCEPTED
        MilestoneType.ARRIVE_ORIGIN -> TripStatus.AT_ORIGIN
        MilestoneType.START_LOADING -> TripStatus.LOADING
        MilestoneType.LOADING_COMPLETE -> TripStatus.LOADED
        MilestoneType.DEPART -> TripStatus.DEPARTED
        MilestoneType.ARRIVE_DESTINATION -> TripStatus.AT_DESTINATION
        MilestoneType.START_UNLOADING -> TripStatus.UNLOADING
        MilestoneType.DELIVERY_COMPLETE -> TripStatus.DELIVERED
        MilestoneType.SUBMIT_POD -> TripStatus.POD_SUBMITTED
    }
}
