package com.axleops.mobile.trip.usecase

import com.axleops.mobile.data.local.MutationStatus
import com.axleops.mobile.data.local.OfflineQueue
import com.axleops.mobile.data.local.QueuedMutation

/**
 * Use case for draining the offline queue when connectivity returns.
 *
 * Processes mutations in FIFO order. If any mutation is rejected
 * (server returns 422), halts processing and marks the mutation
 * as failed. Subsequent mutations remain pending.
 *
 * Source: spec FR-100–FR-104, plan §9
 */
class SyncOfflineQueueUseCase(
    private val offlineQueue: OfflineQueue,
    private val transitionMilestone: TransitionMilestoneUseCase,
) {
    /**
     * Drain all pending mutations.
     *
     * @return Number of successfully synced mutations.
     */
    suspend fun sync(): Int {
        val pending = offlineQueue.pending()
        var syncedCount = 0

        for (mutation in pending) {
            try {
                executeMutation(mutation)
                offlineQueue.markSynced(mutation.mutationId)
                syncedCount++
            } catch (e: Exception) {
                // Halt on first failure — remaining stay pending
                offlineQueue.markFailed(mutation.mutationId, e.message ?: "Sync failed")
                break
            }
        }

        offlineQueue.clearSynced()
        return syncedCount
    }

    private suspend fun executeMutation(mutation: QueuedMutation) {
        when (mutation) {
            is QueuedMutation.QueuedTransition -> {
                transitionMilestone(
                    tripId = mutation.tripId,
                    event = mutation.event,
                    capturedData = mutation.capturedData,
                    evidenceIds = mutation.evidenceIds,
                    latitude = mutation.latitude,
                    longitude = mutation.longitude,
                    gpsAccuracy = mutation.gpsAccuracy,
                )
            }
            is QueuedMutation.QueuedExpense -> {
                // Future: call LogExpenseUseCase
            }
            is QueuedMutation.QueuedDocument -> {
                // Future: call UploadDocumentUseCase
            }
            is QueuedMutation.QueuedException -> {
                // Future: call ReportExceptionUseCase
            }
            is QueuedMutation.QueuedCheckpoint -> {
                // Future: call CheckpointRepository
            }
        }
    }
}
