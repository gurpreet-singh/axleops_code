package com.axleops.mobile.data.repository

import com.axleops.mobile.data.MockFixtureLoader
import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripFilter
import com.axleops.mobile.domain.repository.TripRepository
import kotlinx.serialization.builtins.ListSerializer

/**
 * Mock [TripRepository] backed by local JSON fixtures.
 *
 * Loads trip data from:
 *   `composeResources/files/mocks/trips/driver-trips.json`
 *
 * Supports client-side filtering to simulate backend query behavior.
 * QA can swap fixture files to test different scenarios:
 * - `driver-trips.json` — normal data
 * - `driver-trips-empty.json` — empty state
 * - `driver-trips-error.json` — error scenarios
 *
 * @param fixturePath The fixture file path relative to `files/mocks/`.
 *   Defaults to `trips/driver-trips.json`.
 */
class MockTripRepository(
    private val fixturePath: String = "trips/driver-trips.json",
) : TripRepository {

    override suspend fun getTrips(filter: TripFilter): List<Trip> {
        val allTrips = MockFixtureLoader.load(
            fixturePath,
            ListSerializer(Trip.serializer()),
        )

        // Apply client-side filtering to simulate backend query behavior
        return allTrips.filter { trip ->
            (filter.driverId == null || trip.driverId == filter.driverId) &&
            (filter.branchId == null || trip.branchId == filter.branchId) &&
            (filter.status == null || trip.status == filter.status)
        }.drop(filter.offset).take(filter.limit)
    }

    override suspend fun getTrip(id: Long): Trip? {
        val allTrips = MockFixtureLoader.load(
            fixturePath,
            ListSerializer(Trip.serializer()),
        )
        return allTrips.firstOrNull { it.id == id }
    }
}
