package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.SyncStatus
import com.axleops.mobile.domain.model.TripException
import com.axleops.mobile.domain.repository.TripExceptionRepository
import kotlinx.datetime.Clock

/**
 * Mock [TripExceptionRepository] — in-memory list.
 */
class MockTripExceptionRepository : TripExceptionRepository {

    private val exceptions = mutableListOf<TripException>()
    private var nextId = 1L

    override suspend fun reportException(tripId: Long, exception: TripException): TripException {
        val created = exception.copy(
            id = nextId++,
            reportedAt = Clock.System.now().toString(),
            syncStatus = SyncStatus.SYNCED,
        )
        exceptions.add(created)
        return created
    }

    override suspend fun getExceptions(tripId: Long): List<TripException> =
        exceptions.filter { it.tripId == tripId }
}
