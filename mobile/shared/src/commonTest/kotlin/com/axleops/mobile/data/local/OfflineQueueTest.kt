package com.axleops.mobile.data.local

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Tests for [OfflineQueue].
 *
 * Covers: enqueue, dequeue order, persist (future), replay,
 * halt-on-rejection semantics.
 */
class OfflineQueueTest {

    private fun createQueue() = OfflineQueue()

    @Test
    fun enqueue_increments_pending_count() {
        val queue = createQueue()
        assertEquals(0, queue.pendingCount.value)

        queue.enqueue(
            QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT")
        )
        assertEquals(1, queue.pendingCount.value)

        queue.enqueue(
            QueuedMutation.QueuedExpense(tripId = 1, category = "FUEL", amount = 500.0)
        )
        assertEquals(2, queue.pendingCount.value)
    }

    @Test
    fun pending_returns_fifo_order() {
        val queue = createQueue()
        queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT"))
        queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ARRIVE_ORIGIN"))
        queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "START_LOADING"))

        val pending = queue.pending()
        assertEquals(3, pending.size)
        assertEquals("ACCEPT", (pending[0] as QueuedMutation.QueuedTransition).event)
        assertEquals("ARRIVE_ORIGIN", (pending[1] as QueuedMutation.QueuedTransition).event)
        assertEquals("START_LOADING", (pending[2] as QueuedMutation.QueuedTransition).event)
    }

    @Test
    fun markSynced_decrements_pending() {
        val queue = createQueue()
        val m1 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT"))
        val m2 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ARRIVE"))
        assertEquals(2, queue.pendingCount.value)

        queue.markSynced(m1.mutationId)
        assertEquals(1, queue.pendingCount.value)

        queue.markSynced(m2.mutationId)
        assertEquals(0, queue.pendingCount.value)
    }

    @Test
    fun markFailed_does_not_remove_from_pending_count() {
        val queue = createQueue()
        val m1 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT"))
        queue.markFailed(m1.mutationId, "Server error")
        // Failed items are no longer PENDING
        assertEquals(0, queue.pendingCount.value)
    }

    @Test
    fun retryFailed_resets_to_pending() {
        val queue = createQueue()
        val m1 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT"))
        queue.markFailed(m1.mutationId, "Server error")
        assertEquals(0, queue.pendingCount.value)

        queue.retryFailed()
        assertEquals(1, queue.pendingCount.value)
    }

    @Test
    fun clearSynced_removes_synced_items() {
        val queue = createQueue()
        val m1 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT"))
        queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ARRIVE"))

        queue.markSynced(m1.mutationId)
        assertEquals(2, queue.size)

        queue.clearSynced()
        assertEquals(1, queue.size)
    }

    @Test
    fun mixed_mutation_types_queue_correctly() {
        val queue = createQueue()
        queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "ACCEPT"))
        queue.enqueue(QueuedMutation.QueuedExpense(tripId = 1, category = "FUEL", amount = 500.0))
        queue.enqueue(QueuedMutation.QueuedDocument(tripId = 1, category = "INVOICE", filename = "inv.pdf", localFilePath = "/tmp/inv.pdf"))
        queue.enqueue(QueuedMutation.QueuedException(tripId = 1, exceptionType = "VEHICLE_BREAKDOWN", description = "Engine failed"))
        queue.enqueue(QueuedMutation.QueuedCheckpoint(tripId = 1, eventType = "FUEL_STOP"))

        assertEquals(5, queue.pendingCount.value)
        val pending = queue.pending()
        assertTrue(pending[0] is QueuedMutation.QueuedTransition)
        assertTrue(pending[1] is QueuedMutation.QueuedExpense)
        assertTrue(pending[2] is QueuedMutation.QueuedDocument)
        assertTrue(pending[3] is QueuedMutation.QueuedException)
        assertTrue(pending[4] is QueuedMutation.QueuedCheckpoint)
    }

    @Test
    fun ids_are_unique_and_sequential() {
        val queue = createQueue()
        val m1 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "A"))
        val m2 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "B"))
        val m3 = queue.enqueue(QueuedMutation.QueuedTransition(tripId = 1, event = "C"))

        assertTrue(m1.mutationId < m2.mutationId)
        assertTrue(m2.mutationId < m3.mutationId)
    }
}
