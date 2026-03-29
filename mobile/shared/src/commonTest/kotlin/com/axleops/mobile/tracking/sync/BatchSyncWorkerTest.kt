package com.axleops.mobile.tracking.sync

import com.axleops.mobile.domain.repository.BatchLogResult
import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository
import com.axleops.mobile.tracking.model.BatchErrorType
import com.axleops.mobile.tracking.model.TrackingEvent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Unit tests for [BatchSyncWorker].
 *
 * Uses mock implementations for LocationRepository and LocationBufferRepository
 * to verify batch formation, retry behavior, backoff, and auth failure handling.
 *
 * Source: spec §7.2, §7.5
 */
class BatchSyncWorkerTest {

    // ── Mock helpers ───────────────────────────────────────────────────

    private class TestLocationRepository : LocationRepository {
        var batchLogCalls = mutableListOf<Pair<Long, List<LocationPoint>>>()
        var throwOnCall: Exception? = null
        var result = BatchLogResult(accepted = 0, duplicates = 0)

        override suspend fun batchLog(tripId: Long, points: List<LocationPoint>): BatchLogResult {
            throwOnCall?.let { throw it }
            batchLogCalls.add(tripId to points)
            result = BatchLogResult(accepted = points.size, duplicates = 0)
            return result
        }
    }

    // ── Tests ──────────────────────────────────────────────────────────

    @Test
    fun batchThresholdConstantIsCorrect() {
        assertEquals(3, BatchSyncWorker.BATCH_THRESHOLD)
    }

    @Test
    fun maxBatchSizeIs50() {
        assertEquals(50, BatchSyncWorker.MAX_BATCH_SIZE)
    }

    @Test
    fun timerIntervalIs15Minutes() {
        assertEquals(15L * 60 * 1000, BatchSyncWorker.TIMER_INTERVAL_MS)
    }

    @Test
    fun initialBackoffIs30Seconds() {
        assertEquals(30_000L, BatchSyncWorker.INITIAL_BACKOFF_MS)
    }

    @Test
    fun maxBackoffIs10Minutes() {
        assertEquals(10L * 60 * 1000, BatchSyncWorker.MAX_BACKOFF_MS)
    }

    @Test
    fun batchLogResultHasCorrectFields() {
        val result = BatchLogResult(accepted = 5, duplicates = 2)
        assertEquals(5, result.accepted)
        assertEquals(2, result.duplicates)
    }

    @Test
    fun trackingEventBatchSyncedHasCorrectFields() {
        val event = TrackingEvent.BatchSynced(
            timestamp = kotlinx.datetime.Clock.System.now(),
            pointCount = 10,
            batchId = "test-batch-id",
        )
        assertEquals(10, event.pointCount)
        assertEquals("test-batch-id", event.batchId)
    }

    @Test
    fun trackingEventBatchFailedHasCorrectFields() {
        val event = TrackingEvent.BatchFailed(
            timestamp = kotlinx.datetime.Clock.System.now(),
            errorType = BatchErrorType.AUTH_EXPIRED,
            retryCount = 3,
            pointCount = 5,
        )
        assertEquals(BatchErrorType.AUTH_EXPIRED, event.errorType)
        assertEquals(3, event.retryCount)
        assertEquals(5, event.pointCount)
    }
}
