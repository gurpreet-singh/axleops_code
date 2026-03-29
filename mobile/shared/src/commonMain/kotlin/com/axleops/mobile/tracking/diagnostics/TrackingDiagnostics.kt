package com.axleops.mobile.tracking.diagnostics

import com.axleops.mobile.tracking.model.TrackingEvent
import com.axleops.mobile.tracking.model.TrackingState
import kotlinx.datetime.Clock
import kotlinx.datetime.Instant

/**
 * Structured local logger for tracking health diagnostics.
 *
 * Captures metrics for field debugging and QA:
 * 1. Capture success rate
 * 2. Gap count (> 10 min)
 * 3. Longest gap
 * 4. Battery level trend
 * 5. OS kill events
 * 6. Permission state changes
 *
 * Logs are stored in memory and can be exported as text.
 * Capped at 7 days of entries.
 *
 * Source: spec §7.6, plan §11
 */
class TrackingDiagnostics {

    private val entries = mutableListOf<DiagnosticEntry>()

    /** Maximum age of entries (7 days in milliseconds). */
    private val maxAgeMs = 7L * 24 * 60 * 60 * 1000

    // Counters for the current tracking session
    private var captureAttempts = 0
    private var captureSuccesses = 0
    private var gapCount = 0
    private var longestGapMs = 0L
    private var sessionStartTime: Instant? = null

    /**
     * Log a tracking event for diagnostics.
     */
    fun logEvent(event: TrackingEvent) {
        val entry = when (event) {
            is TrackingEvent.TrackingStarted -> {
                sessionStartTime = event.timestamp
                captureAttempts = 0
                captureSuccesses = 0
                gapCount = 0
                longestGapMs = 0
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "TRACKING_STARTED",
                    details = "Trip ${event.tripId}",
                )
            }
            is TrackingEvent.TrackingStopped -> {
                val duration = sessionStartTime?.let {
                    (event.timestamp - it).inWholeMinutes
                } ?: 0
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "TRACKING_STOPPED",
                    details = "Trip ${event.tripId}, reason=${event.reason}, " +
                        "duration=${duration}min, " +
                        "captures=$captureSuccesses/$captureAttempts, " +
                        "gaps=$gapCount, longestGap=${longestGapMs / 1000}s",
                )
            }
            is TrackingEvent.TrackingResumed -> {
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "TRACKING_RESUMED",
                    details = "Trip ${event.tripId}, gap=${event.gapDurationMs / 1000}s",
                )
            }
            is TrackingEvent.GpsSignalLost -> {
                gapCount++
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "GPS_SIGNAL_LOST",
                    details = "Last known: ${event.lastLatitude},${event.lastLongitude}",
                )
            }
            is TrackingEvent.GpsSignalRestored -> {
                if (event.gapDurationMs > longestGapMs) {
                    longestGapMs = event.gapDurationMs
                }
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "GPS_SIGNAL_RESTORED",
                    details = "Gap=${event.gapDurationMs / 1000}s, " +
                        "restored at ${event.latitude},${event.longitude}",
                )
            }
            is TrackingEvent.BatchSynced -> {
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "BATCH_SYNCED",
                    details = "${event.pointCount} points, batch=${event.batchId.take(8)}",
                )
            }
            is TrackingEvent.BatchFailed -> {
                DiagnosticEntry(
                    timestamp = event.timestamp,
                    type = "BATCH_FAILED",
                    details = "${event.pointCount} points, error=${event.errorType}, " +
                        "retry=${event.retryCount}",
                )
            }
        }
        addEntry(entry)
    }

    /**
     * Log a GPS capture attempt and its result.
     */
    fun logCaptureAttempt(success: Boolean) {
        captureAttempts++
        if (success) captureSuccesses++
    }

    /**
     * Log battery level at a point in time.
     */
    fun logBatteryLevel(batteryPercent: Int) {
        addEntry(
            DiagnosticEntry(
                timestamp = Clock.System.now(),
                type = "BATTERY_LEVEL",
                details = "$batteryPercent%",
            )
        )
    }

    /**
     * Log a permission state change.
     */
    fun logPermissionChange(newState: String, previousState: String) {
        addEntry(
            DiagnosticEntry(
                timestamp = Clock.System.now(),
                type = "PERMISSION_CHANGE",
                details = "$previousState → $newState",
            )
        )
    }

    /**
     * Log a tracking state change.
     */
    fun logStateChange(from: TrackingState, to: TrackingState) {
        addEntry(
            DiagnosticEntry(
                timestamp = Clock.System.now(),
                type = "STATE_CHANGE",
                details = "$from → $to",
            )
        )
    }

    /**
     * Log an OS kill / recovery event.
     */
    fun logOsKillRecovery(gapDurationMs: Long) {
        addEntry(
            DiagnosticEntry(
                timestamp = Clock.System.now(),
                type = "OS_KILL_RECOVERY",
                details = "Gap=${gapDurationMs / 1000}s",
            )
        )
    }

    /**
     * Get the current session's capture success rate.
     */
    fun captureSuccessRate(): Double {
        if (captureAttempts == 0) return 0.0
        return captureSuccesses.toDouble() / captureAttempts
    }

    /**
     * Export all diagnostic entries as a structured text report.
     * Used by the QA debug panel export feature.
     */
    fun exportAsText(): String {
        purgeOldEntries()
        val sb = StringBuilder()
        sb.appendLine("=== AxleOps Tracking Diagnostics ===")
        sb.appendLine("Exported: ${Clock.System.now()}")
        sb.appendLine("Total entries: ${entries.size}")
        sb.appendLine("Session stats: captures=$captureSuccesses/$captureAttempts, " +
            "gaps=$gapCount, longestGap=${longestGapMs / 1000}s")
        sb.appendLine("Success rate: ${"%.1f".format(captureSuccessRate() * 100)}%")
        sb.appendLine()
        entries.forEach { entry ->
            sb.appendLine("[${entry.timestamp}] ${entry.type}: ${entry.details}")
        }
        return sb.toString()
    }

    /**
     * Get all entries (for debug panel display).
     */
    fun getEntries(): List<DiagnosticEntry> {
        purgeOldEntries()
        return entries.toList()
    }

    // ---- Internal ----

    private fun addEntry(entry: DiagnosticEntry) {
        entries.add(entry)
        // Periodic purge (every 100 entries)
        if (entries.size % 100 == 0) purgeOldEntries()
    }

    private fun purgeOldEntries() {
        val cutoff = Clock.System.now().toEpochMilliseconds() - maxAgeMs
        entries.removeAll { it.timestamp.toEpochMilliseconds() < cutoff }
    }
}

/**
 * A single diagnostic log entry.
 */
data class DiagnosticEntry(
    val timestamp: Instant,
    val type: String,
    val details: String,
)
