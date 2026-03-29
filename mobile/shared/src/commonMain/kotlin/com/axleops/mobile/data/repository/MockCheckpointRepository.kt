package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.CheckpointEvent
import com.axleops.mobile.domain.model.SyncStatus
import com.axleops.mobile.domain.repository.CheckpointRepository
import kotlinx.datetime.Clock

/**
 * Mock [CheckpointRepository] — in-memory list.
 */
class MockCheckpointRepository : CheckpointRepository {

    private val checkpoints = mutableListOf<CheckpointEvent>()
    private var nextId = 1L

    override suspend fun logCheckpoint(tripId: Long, event: CheckpointEvent): CheckpointEvent {
        val created = event.copy(
            id = nextId++,
            occurredAt = Clock.System.now().toString(),
            syncStatus = SyncStatus.SYNCED,
        )
        checkpoints.add(created)
        return created
    }

    override suspend fun getCheckpoints(tripId: Long): List<CheckpointEvent> =
        checkpoints.filter { it.tripId == tripId }
}
