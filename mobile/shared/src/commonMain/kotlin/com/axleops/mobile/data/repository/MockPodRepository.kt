package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.Pod
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.domain.repository.PodRepository
import com.axleops.mobile.domain.repository.TripRepository
import kotlinx.coroutines.delay

/**
 * Mock [PodRepository] — simulates POD submission.
 *
 * Accepts POD payload, simulates upload delay, updates trip status
 * to POD_SUBMITTED via TripRepository.
 */
class MockPodRepository(
    private val tripRepository: TripRepository,
) : PodRepository {

    override suspend fun submitPod(tripId: Long, pod: Pod): TripDetail {
        // Simulate upload delay
        delay(1000)

        // Get current trip and update status
        val trip = tripRepository.getActiveTrip()
            ?: throw IllegalStateException("No active trip found")

        return trip.copy(
            status = TripStatus.POD_SUBMITTED,
            pod = pod,
        )
    }
}
