package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.repository.TripRepository

/**
 * Fetches the driver's currently active trip.
 *
 * This is the primary entry point for the Active Trip tab.
 * Handles:
 * - Fetching from repository (real or mock based on DataSourceConfig)
 * - Returning null for empty state (no active trip)
 * - Throwing on network/parse failure (caller handles via UiState)
 *
 * Source: spec FR-001 (Active Trip tab must show current trip or empty state)
 */
class GetActiveTripUseCase(
    private val tripRepository: TripRepository,
) {
    /**
     * Fetch the driver's active trip.
     *
     * @return [TripDetail] or null if no trip is assigned.
     * @throws Exception on network/parse failure.
     */
    suspend operator fun invoke(): TripDetail? =
        tripRepository.getActiveTrip()
}
