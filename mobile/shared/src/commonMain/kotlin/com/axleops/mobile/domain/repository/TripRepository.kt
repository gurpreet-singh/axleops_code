package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripFilter

/**
 * Repository interface for Trip data access.
 *
 * Implementations:
 * - [RealTripRepository] -- Ktor-backed, calls `GET /trips`
 * - [MockTripRepository] -- loads from JSON fixtures in compose resources
 *
 * Role-specific scoping is achieved via [TripFilter] parameters,
 * not separate repository implementations. The same interface serves
 * all roles.
 */
interface TripRepository {

    /**
     * Fetch trips matching the given [filter].
     *
     * @param filter Query parameters for scoping results.
     * @return List of matching trips, or empty list if none found.
     * @throws Exception on network/parse failure.
     */
    suspend fun getTrips(filter: TripFilter = TripFilter()): List<Trip>

    /**
     * Fetch a single trip by ID.
     *
     * @param id The trip's backend ID.
     * @return The trip, or null if not found.
     * @throws Exception on network/parse failure.
     */
    suspend fun getTrip(id: Long): Trip?

    // ── Active Trip Methods (Derived Contracts) ──────────────────────────
    //
    // These methods support the Driver Active Trip feature.
    // Backend gap: No dedicated endpoints exist yet.
    // Mock implementations provide full behavior.
    // Real implementations stub to the closest available endpoints.

    /**
     * Fetch the driver's currently active trip (dispatched or in-progress).
     *
     * Derived contract: `GET /trips/driver/active`
     * Backend gap G1: Backend does not yet support driver-scoped active trip query.
     *
     * @return The active [TripDetail], or null if no trip is assigned.
     * @throws Exception on network/parse failure.
     */
    suspend fun getActiveTrip(): TripDetail?

    /**
     * Accept a dispatched trip.
     *
     * Derived contract: `POST /trips/{id}/accept`
     * Backend gap G2: Backend does not yet support driver accept/reject.
     *
     * @param tripId The trip ID to accept.
     * @return The updated [TripDetail] after acceptance.
     * @throws Exception on network/parse failure or if transition is invalid.
     */
    suspend fun acceptTrip(tripId: Long): TripDetail

    /**
     * Reject a dispatched trip with a reason.
     *
     * Derived contract: `POST /trips/{id}/reject`
     * Backend gap G2: Backend does not yet support driver accept/reject.
     *
     * @param tripId The trip ID to reject.
     * @param reason Driver-provided rejection reason.
     * @return The updated [TripDetail] after rejection.
     * @throws Exception on network/parse failure or if transition is invalid.
     */
    suspend fun rejectTrip(tripId: Long, reason: String): TripDetail
}
