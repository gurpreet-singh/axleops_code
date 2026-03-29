package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.Pod
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.repository.PodRepository

/**
 * Use case for submitting a Proof of Delivery.
 *
 * Orchestrates photo uploads → signature upload → metadata submission.
 * Future: handles partial failure with retry.
 *
 * Source: spec FR-090–FR-097
 */
class SubmitPodUseCase(
    private val podRepository: PodRepository,
) {
    suspend operator fun invoke(tripId: Long, pod: Pod): TripDetail {
        return podRepository.submitPod(tripId, pod)
    }
}
