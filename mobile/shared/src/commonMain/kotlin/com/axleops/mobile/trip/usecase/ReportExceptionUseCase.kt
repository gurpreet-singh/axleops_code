package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.TripException
import com.axleops.mobile.domain.repository.TripExceptionRepository

/**
 * Use case for reporting a trip exception.
 *
 * Future: Queues to OfflineQueue if network unavailable.
 *
 * Source: spec FR-080–FR-084
 */
class ReportExceptionUseCase(
    private val exceptionRepository: TripExceptionRepository,
) {
    suspend operator fun invoke(tripId: Long, exception: TripException): TripException {
        return exceptionRepository.reportException(tripId, exception)
    }
}
