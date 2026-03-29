package com.axleops.mobile.data.repository

import com.axleops.mobile.data.MockFixtureLoader
import com.axleops.mobile.data.dto.TripDetailDto
import com.axleops.mobile.data.mapper.TripMapper
import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripFilter
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.domain.repository.TripRepository
import kotlinx.serialization.builtins.ListSerializer

/**
 * Mock [TripRepository] backed by local JSON fixtures.
 *
 * Loads trip data from compose resources under `files/mocks/`.
 * Implements full active trip lifecycle in-memory: accept/reject
 * mutate the cached trip state so UI updates reflect immediately.
 *
 * QA can swap fixture files to test different scenarios.
 */
class MockTripRepository(
    private val listFixturePath: String = "trips/driver-trips.json",
    private val activeFixturePath: String = "trip/active-trip-dispatched.json",
) : TripRepository {

    /** In-memory cached active trip for state mutation (accept/reject). */
    private var cachedActiveTrip: TripDetail? = null

    override suspend fun getTrips(filter: TripFilter): List<Trip> {
        val allTrips = MockFixtureLoader.load(
            listFixturePath,
            ListSerializer(Trip.serializer()),
        )

        return allTrips.filter { trip ->
            (filter.driverId == null || trip.driverId == filter.driverId) &&
            (filter.branchId == null || trip.branchId == filter.branchId) &&
            (filter.status == null || trip.status == filter.status)
        }.drop(filter.offset).take(filter.limit)
    }

    override suspend fun getTrip(id: Long): Trip? {
        val allTrips = MockFixtureLoader.load(
            listFixturePath,
            ListSerializer(Trip.serializer()),
        )
        return allTrips.firstOrNull { it.id == id }
    }

    override suspend fun getActiveTrip(): TripDetail? {
        // Return cached state if we've already loaded and mutated it
        cachedActiveTrip?.let { return it }

        return try {
            val dtos = MockFixtureLoader.load(
                activeFixturePath,
                ListSerializer(TripDetailDto.serializer()),
            )
            val detail = dtos.firstOrNull()?.let { TripMapper.toDomain(it) }
            cachedActiveTrip = detail
            detail
        } catch (_: Exception) {
            null
        }
    }

    override suspend fun acceptTrip(tripId: Long): TripDetail {
        val current = getActiveTrip()
            ?: throw IllegalStateException("No active trip to accept")

        require(current.id == tripId) { "Trip ID mismatch" }
        require(current.status == TripStatus.DISPATCHED) {
            "Cannot accept trip in ${current.status} state"
        }

        val accepted = current.copy(
            status = TripStatus.ACCEPTED,
            acceptedAt = kotlinx.datetime.Clock.System.now().toString(),
        )
        cachedActiveTrip = accepted
        return accepted
    }

    override suspend fun rejectTrip(tripId: Long, reason: String): TripDetail {
        val current = getActiveTrip()
            ?: throw IllegalStateException("No active trip to reject")

        require(current.id == tripId) { "Trip ID mismatch" }
        require(current.status == TripStatus.DISPATCHED) {
            "Cannot reject trip in ${current.status} state"
        }

        val rejected = current.copy(status = TripStatus.DRIVER_REJECTED)
        cachedActiveTrip = rejected
        return rejected
    }
}
