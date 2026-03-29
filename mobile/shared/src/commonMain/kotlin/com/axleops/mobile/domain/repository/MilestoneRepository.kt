package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.Milestone
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TransitionRequest

/**
 * Repository interface for Milestone data access.
 *
 * Milestones represent the 10-step lifecycle of a trip.
 * This repository handles fetching milestone state and
 * submitting driver-initiated transitions.
 *
 * Backend gap G3: `GET /trips/{id}/milestones` does not exist yet.
 * Backend gap G2: `POST /trips/{id}/transition` does not exist yet.
 *
 * Implementations:
 * - [MockMilestoneRepository] — fixture-backed, in-memory state machine
 * - [RealMilestoneRepository] — API calls to derived endpoints
 */
interface MilestoneRepository {

    /**
     * Fetch all milestones for a trip, ordered by sequence.
     *
     * @param tripId The trip's backend ID.
     * @return Ordered list of milestones.
     * @throws Exception on network/parse failure.
     */
    suspend fun getMilestones(tripId: Long): List<Milestone>

    /**
     * Submit a milestone transition request.
     *
     * The backend (or mock) validates the transition against its state machine,
     * updates the milestone status, and advances the trip status.
     *
     * @param tripId The trip's backend ID.
     * @param request The transition payload (event, GPS, captured data).
     * @return The updated [TripDetail] reflecting the new state.
     * @throws Exception on invalid transition, network failure, or 422 rejection.
     */
    suspend fun transition(tripId: Long, request: TransitionRequest): TripDetail
}
