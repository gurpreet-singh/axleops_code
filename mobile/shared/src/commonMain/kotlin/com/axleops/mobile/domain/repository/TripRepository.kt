package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripFilter

/**
 * Repository interface for Trip data access.
 *
 * Implementations:
 * - [RealTripRepository] — Ktor-backed, calls `GET /trips`
 * - [MockTripRepository] — loads from JSON fixtures in compose resources
 *
 * Role-specific scoping is achieved via [TripFilter] parameters,
 * not separate repository implementations. The same interface serves
 * all roles.
 *
 * ⚠️ Backend gap: `GET /trips` does not yet support `?driverId=` filtering.
 * Driver-scoped queries are mock-backed in v1.
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
}
