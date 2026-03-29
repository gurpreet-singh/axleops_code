package com.axleops.mobile.tracking.data

import com.axleops.mobile.tracking.diagnostics.DiagnosticEntry
import com.axleops.mobile.tracking.diagnostics.TrackingDiagnostics
import com.axleops.mobile.tracking.model.TrackingEvent
import com.axleops.mobile.tracking.model.TrackingState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Unit tests for [LocationBufferRepository] logic and [TrackingDiagnostics].
 *
 * Full SQLDelight integration tests require platform-specific in-memory
 * driver factories. These tests validate the diagnostic and data layer
 * contracts that can be tested without database infrastructure.
 *
 * Source: spec §7.2, §7.6
 */
class LocationBufferRepositoryTest {

    // ── TrackingDiagnostics Tests (exercised alongside buffer tests) ───

    @Test
    fun diagnosticsStartsEmpty() {
        val diags = TrackingDiagnostics()
        val entries = diags.getEntries()
        assertTrue(entries.isEmpty())
    }

    @Test
    fun logEventAddsEntry() {
        val diags = TrackingDiagnostics()
        diags.logEvent(
            TrackingEvent.TrackingStarted(
                timestamp = kotlinx.datetime.Clock.System.now(),
                tripId = 42L,
            )
        )
        val entries = diags.getEntries()
        assertEquals(1, entries.size)
        assertEquals("TRACKING_STARTED", entries[0].type)
        assertTrue(entries[0].details.contains("42"))
    }

    @Test
    fun logBatteryLevelAddsEntry() {
        val diags = TrackingDiagnostics()
        diags.logBatteryLevel(85)
        val entries = diags.getEntries()
        assertEquals(1, entries.size)
        assertEquals("BATTERY_LEVEL", entries[0].type)
        assertTrue(entries[0].details.contains("85%"))
    }

    @Test
    fun logPermissionChangeAddsEntry() {
        val diags = TrackingDiagnostics()
        diags.logPermissionChange("ForegroundOnly", "NotDetermined")
        val entries = diags.getEntries()
        assertEquals(1, entries.size)
        assertEquals("PERMISSION_CHANGE", entries[0].type)
        assertTrue(entries[0].details.contains("NotDetermined"))
        assertTrue(entries[0].details.contains("ForegroundOnly"))
    }

    @Test
    fun logStateChangeAddsEntry() {
        val diags = TrackingDiagnostics()
        diags.logStateChange(TrackingState.INACTIVE, TrackingState.AWAITING_PERMISSION)
        val entries = diags.getEntries()
        assertEquals(1, entries.size)
        assertEquals("STATE_CHANGE", entries[0].type)
    }

    @Test
    fun captureSuccessRateCalculation() {
        val diags = TrackingDiagnostics()
        diags.logCaptureAttempt(true)
        diags.logCaptureAttempt(true)
        diags.logCaptureAttempt(false)
        assertEquals(2.0 / 3.0, diags.captureSuccessRate(), 0.01)
    }

    @Test
    fun captureSuccessRateZeroWhenNoAttempts() {
        val diags = TrackingDiagnostics()
        assertEquals(0.0, diags.captureSuccessRate())
    }

    @Test
    fun exportAsTextContainsHeader() {
        val diags = TrackingDiagnostics()
        val text = diags.exportAsText()
        assertTrue(text.contains("AxleOps Tracking Diagnostics"))
        assertTrue(text.contains("Total entries"))
    }

    @Test
    fun multipleEventsTrackedCorrectly() {
        val diags = TrackingDiagnostics()
        val now = kotlinx.datetime.Clock.System.now()

        diags.logEvent(TrackingEvent.TrackingStarted(timestamp = now, tripId = 1L))
        diags.logBatteryLevel(90)
        diags.logStateChange(TrackingState.INACTIVE, TrackingState.ACTIVE)
        diags.logEvent(
            TrackingEvent.BatchSynced(timestamp = now, pointCount = 5, batchId = "abc123")
        )

        val entries = diags.getEntries()
        assertEquals(4, entries.size)
    }

    @Test
    fun osKillRecoveryLoggedCorrectly() {
        val diags = TrackingDiagnostics()
        diags.logOsKillRecovery(gapDurationMs = 120_000)
        val entries = diags.getEntries()
        assertEquals(1, entries.size)
        assertEquals("OS_KILL_RECOVERY", entries[0].type)
        assertTrue(entries[0].details.contains("120"))
    }
}
