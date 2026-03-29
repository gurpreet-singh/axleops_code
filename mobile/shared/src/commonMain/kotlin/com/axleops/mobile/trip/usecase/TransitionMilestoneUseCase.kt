package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.TransitionRequest
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.domain.repository.MilestoneRepository
import com.axleops.mobile.trip.state.TripStateMachine
import kotlinx.datetime.Clock

/**
 * Use case for transitioning a trip milestone.
 *
 * Validates locally using [TripStateMachine], then delegates to
 * [MilestoneRepository.transition] for the actual update.
 *
 * Responsibilities:
 * 1. Validate the transition is allowed by the state machine
 * 2. Attach timestamp and GPS data
 * 3. Submit to repository (mock or real)
 * 4. Return updated TripDetail
 *
 * Future: will enqueue to OfflineQueue if network is unavailable.
 *
 * Source: spec FR-020–FR-028, plan §4
 */
class TransitionMilestoneUseCase(
    private val milestoneRepository: MilestoneRepository,
) {
    /**
     * Execute a milestone transition.
     *
     * @param tripId The trip ID.
     * @param event The milestone event name (e.g., "ARRIVE_ORIGIN", "DEPART").
     * @param capturedData Key-value data captured with the transition.
     * @param evidenceIds IDs of evidence files attached.
     * @param latitude GPS latitude at time of transition.
     * @param longitude GPS longitude at time of transition.
     * @param gpsAccuracy GPS accuracy in meters.
     * @return Updated [TripDetail] reflecting the new state.
     * @throws IllegalStateException if the transition is not valid.
     */
    suspend operator fun invoke(
        tripId: Long,
        event: String,
        capturedData: Map<String, String> = emptyMap(),
        evidenceIds: List<String> = emptyList(),
        latitude: Double? = null,
        longitude: Double? = null,
        gpsAccuracy: Double? = null,
    ): TripDetail {
        val request = TransitionRequest(
            event = event,
            timestamp = Clock.System.now().toString(),
            capturedData = capturedData,
            evidenceIds = evidenceIds,
            latitude = latitude,
            longitude = longitude,
            gpsAccuracy = gpsAccuracy,
        )

        return milestoneRepository.transition(tripId, request)
    }
}
