package com.axleops.mobile.data.local

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Persistent ordered offline queue for mutations.
 *
 * Stores mutations in chronological order. When connectivity returns,
 * [SyncOfflineQueueUseCase] drains in FIFO order, halting on rejection.
 *
 * Current implementation: in-memory list.
 * Future: persist via multiplatform-settings or SQLDelight.
 *
 * Source: spec FR-100–FR-104, plan §9
 */
class OfflineQueue {

    private val queue = mutableListOf<QueuedMutation>()
    private var nextId = 1L

    private val _pendingCount = MutableStateFlow(0)
    val pendingCount: StateFlow<Int> = _pendingCount.asStateFlow()

    /**
     * Add a mutation to the queue.
     */
    fun enqueue(mutation: QueuedMutation): QueuedMutation {
        val queued = mutation.withId(nextId++)
        queue.add(queued)
        _pendingCount.value = queue.count { it.status == MutationStatus.PENDING }
        return queued
    }

    /**
     * Get all pending mutations in chronological order.
     */
    fun pending(): List<QueuedMutation> =
        queue.filter { it.status == MutationStatus.PENDING }
            .sortedBy { it.queuedAt }

    /**
     * Mark a mutation as successfully synced.
     */
    fun markSynced(id: Long) {
        val index = queue.indexOfFirst { it.mutationId == id }
        if (index >= 0) {
            queue[index] = queue[index].withStatus(MutationStatus.SYNCED)
        }
        _pendingCount.value = queue.count { it.status == MutationStatus.PENDING }
    }

    /**
     * Mark a mutation as failed (will retry on next sync attempt).
     */
    fun markFailed(id: Long, error: String) {
        val index = queue.indexOfFirst { it.mutationId == id }
        if (index >= 0) {
            queue[index] = queue[index].withStatus(MutationStatus.FAILED)
        }
        _pendingCount.value = queue.count { it.status == MutationStatus.PENDING }
    }

    /**
     * Clear all synced mutations from the queue.
     */
    fun clearSynced() {
        queue.removeAll { it.status == MutationStatus.SYNCED }
    }

    /**
     * Reset failed mutations back to pending for retry.
     */
    fun retryFailed() {
        queue.forEachIndexed { index, mutation ->
            if (mutation.status == MutationStatus.FAILED) {
                queue[index] = mutation.withStatus(MutationStatus.PENDING)
            }
        }
        _pendingCount.value = queue.count { it.status == MutationStatus.PENDING }
    }

    /** Total queued items including all statuses. */
    val size: Int get() = queue.size
}

/**
 * Status of a queued mutation.
 */
enum class MutationStatus {
    PENDING,
    SYNCING,
    SYNCED,
    FAILED,
}
