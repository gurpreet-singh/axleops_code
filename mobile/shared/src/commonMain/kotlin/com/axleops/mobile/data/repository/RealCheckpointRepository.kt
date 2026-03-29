package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.CheckpointEvent
import com.axleops.mobile.domain.repository.CheckpointRepository
import io.ktor.client.HttpClient

/**
 * Real [CheckpointRepository] — backend-backed.
 *
 * Backend gap G7: Checkpoint API does not exist yet.
 */
class RealCheckpointRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : CheckpointRepository {

    override suspend fun logCheckpoint(tripId: Long, event: CheckpointEvent): CheckpointEvent =
        throw UnsupportedOperationException("Backend checkpoint API not available (gap G7)")

    override suspend fun getCheckpoints(tripId: Long): List<CheckpointEvent> = emptyList()
}
