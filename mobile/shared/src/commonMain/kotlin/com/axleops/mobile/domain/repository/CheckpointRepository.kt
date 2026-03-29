package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.CheckpointEvent

/**
 * Repository interface for checkpoint event logging.
 *
 * Checkpoint events are logged during transit phases
 * (DEPARTED, IN_TRANSIT, AT_CHECKPOINT).
 *
 * Backend gap G7: Checkpoint API does not exist yet.
 *
 * Source: spec FR-085–FR-088
 */
interface CheckpointRepository {
    suspend fun logCheckpoint(tripId: Long, event: CheckpointEvent): CheckpointEvent
    suspend fun getCheckpoints(tripId: Long): List<CheckpointEvent>
}
