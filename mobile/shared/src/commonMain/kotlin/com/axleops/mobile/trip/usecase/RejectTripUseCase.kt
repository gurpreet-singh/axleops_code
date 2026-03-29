package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.repository.TripRepository

/**
 * Reject a dispatched trip with a reason.
 *
 * Validates that the trip is in DISPATCHED state (via repository),
 * then performs the reject transition. Returns the updated trip detail.
 *
 * Source: spec FR-021 (Reject Trip)
 */
class RejectTripUseCase(
    private val tripRepository: TripRepository,
) {
    /**
     * @param tripId The trip ID to reject.
     * @param reason Driver-provided rejection reason.
     * @return Updated [TripDetail] in DRIVER_REJECTED state.
     * @throws Exception on failure or invalid state.
     */
    suspend operator fun invoke(tripId: Long, reason: String): TripDetail =
        tripRepository.rejectTrip(tripId, reason)
}
