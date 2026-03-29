package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.repository.TripRepository

/**
 * Accept a dispatched trip.
 *
 * Validates that the trip is in DISPATCHED state (via repository),
 * then performs the accept transition. Returns the updated trip detail.
 *
 * Source: spec FR-020 (Accept Trip)
 */
class AcceptTripUseCase(
    private val tripRepository: TripRepository,
) {
    /**
     * @param tripId The trip ID to accept.
     * @return Updated [TripDetail] in ACCEPTED state.
     * @throws Exception on failure or invalid state.
     */
    suspend operator fun invoke(tripId: Long): TripDetail =
        tripRepository.acceptTrip(tripId)
}
