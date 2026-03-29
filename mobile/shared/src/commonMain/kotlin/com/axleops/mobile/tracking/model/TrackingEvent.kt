package com.axleops.mobile.tracking.model

import kotlinx.datetime.Instant

/**
 * Discrete events emitted by the tracking system during its lifecycle.
 *
 * These events are:
 * 1. Logged to [TrackingDiagnostics] for local QA/debug analysis.
 * 2. Stored alongside location points for audit trail enrichment.
 *
 * Source: spec §7.3, plan §5
 */
sealed class TrackingEvent {

    /** When the event occurred. */
    abstract val timestamp: Instant

    /**
     * Tracking began — trip entered DEPARTED state and GPS capture started.
     */
    data class TrackingStarted(
        override val timestamp: Instant,
        /** The trip being tracked. */
        val tripId: Long,
        /** Initial GPS fix at tracking start, if immediately available. */
        val initialLatitude: Double? = null,
        val initialLongitude: Double? = null,
    ) : TrackingEvent()

    /**
     * Tracking ended — trip exited transit state or an error/safety condition triggered stop.
     */
    data class TrackingStopped(
        override val timestamp: Instant,
        /** The trip that was being tracked. */
        val tripId: Long,
        /** Why tracking stopped. */
        val reason: StopReason,
        /** Final GPS fix at tracking stop, if available. */
        val finalLatitude: Double? = null,
        val finalLongitude: Double? = null,
    ) : TrackingEvent()

    /**
     * Tracking resumed after an interruption (OS kill, relaunch).
     * Includes the gap duration for diagnostics.
     */
    data class TrackingResumed(
        override val timestamp: Instant,
        val tripId: Long,
        /** Duration of the tracking gap in milliseconds. */
        val gapDurationMs: Long,
    ) : TrackingEvent()

    /**
     * GPS hardware stopped providing fixes for ≥ 2 consecutive intervals (10 min).
     */
    data class GpsSignalLost(
        override val timestamp: Instant,
        /** Last known position before signal was lost. */
        val lastLatitude: Double? = null,
        val lastLongitude: Double? = null,
    ) : TrackingEvent()

    /**
     * GPS fix re-acquired after a signal loss period.
     */
    data class GpsSignalRestored(
        override val timestamp: Instant,
        /** New position after signal recovery. */
        val latitude: Double,
        val longitude: Double,
        /** Duration of the signal loss in milliseconds. */
        val gapDurationMs: Long,
    ) : TrackingEvent()

    /**
     * A batch of location points was successfully synced to the backend.
     */
    data class BatchSynced(
        override val timestamp: Instant,
        /** Number of points in the synced batch. */
        val pointCount: Int,
        /** Client-generated batch identifier for correlation. */
        val batchId: String,
    ) : TrackingEvent()

    /**
     * A batch submission failed — points remain in the local buffer for retry.
     */
    data class BatchFailed(
        override val timestamp: Instant,
        /** Classification of the failure. */
        val errorType: BatchErrorType,
        /** How many times this batch has been retried. */
        val retryCount: Int,
        /** Number of points in the failed batch. */
        val pointCount: Int,
    ) : TrackingEvent()
}

/**
 * Why tracking was stopped.
 *
 * Source: spec §7.3 (TRACKING_STOPPED additional data: reason)
 */
enum class StopReason {
    /** Trip transitioned to a non-transit state (AT_DESTINATION or later). */
    TRIP_STATE_CHANGE,
    /** Location permission was revoked while tracking was active. */
    PERMISSION_REVOKED,
    /** 48-hour continuous tracking safety net triggered. */
    SAFETY_NET_48H,
    /** An unrecoverable error stopped the tracking system. */
    ERROR,
}

/**
 * Classification of batch sync failure.
 *
 * Source: spec §7.5 (retry behavior)
 */
enum class BatchErrorType {
    /** Network unreachable or connection timeout. */
    NETWORK_ERROR,
    /** Server returned 5xx. */
    SERVER_ERROR,
    /** Server returned 4xx (non-auth). */
    CLIENT_ERROR,
    /** Server returned 401 — session expired. */
    AUTH_EXPIRED,
}
