package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.Pod
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.repository.PodRepository
import io.ktor.client.HttpClient

/**
 * Real [PodRepository] — backend-backed.
 *
 * Backend gap G4: File upload + POD submission API does not exist yet.
 */
class RealPodRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : PodRepository {

    override suspend fun submitPod(tripId: Long, pod: Pod): TripDetail {
        // Backend gap G4: No POD submission endpoint yet
        throw UnsupportedOperationException("Backend POD submission API not available (gap G4)")
    }
}
