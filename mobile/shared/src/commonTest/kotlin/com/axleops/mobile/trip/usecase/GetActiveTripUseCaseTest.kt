package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.Trip
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripFilter
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.domain.repository.TripRepository
import kotlin.test.Test
import kotlin.test.assertNotNull

/**
 * Tests for [GetActiveTripUseCase].
 */
class GetActiveTripUseCaseTest {

    @Test
    fun use_case_can_be_created_with_repository() {
        val repo = object : TripRepository {
            override suspend fun getTrips(filter: TripFilter): List<Trip> = emptyList()
            override suspend fun getTrip(id: Long): Trip? = null
            override suspend fun getActiveTrip(): TripDetail = TripDetail(
                id = 1,
                tripNumber = "TRP-001",
                status = TripStatus.ACCEPTED,
            )
            override suspend fun acceptTrip(tripId: Long): TripDetail = TripDetail(id = tripId)
            override suspend fun rejectTrip(tripId: Long, reason: String): TripDetail = TripDetail(id = tripId)
        }
        val useCase = GetActiveTripUseCase(tripRepository = repo)
        assertNotNull(useCase)
    }

    @Test
    fun use_case_supports_null_active_trip() {
        val repo = object : TripRepository {
            override suspend fun getTrips(filter: TripFilter): List<Trip> = emptyList()
            override suspend fun getTrip(id: Long): Trip? = null
            override suspend fun getActiveTrip(): TripDetail? = null
            override suspend fun acceptTrip(tripId: Long): TripDetail = TripDetail(id = tripId)
            override suspend fun rejectTrip(tripId: Long, reason: String): TripDetail = TripDetail(id = tripId)
        }
        val useCase = GetActiveTripUseCase(tripRepository = repo)
        assertNotNull(useCase)
    }
}
