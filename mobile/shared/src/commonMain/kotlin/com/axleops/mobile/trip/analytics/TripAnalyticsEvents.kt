package com.axleops.mobile.trip.analytics

/**
 * Trip lifecycle analytics event definitions.
 *
 * These events are emitted by trip components and use cases.
 * They are routed to the analytics infrastructure for tracking.
 *
 * Source: plan §15
 */
object TripAnalyticsEvents {

    // ── Driver Action Events ────────────────────────────────────────────

    const val TRIP_ACCEPTED = "trip_accepted"
    const val TRIP_REJECTED = "trip_rejected"
    const val MILESTONE_COMPLETED = "milestone_completed"
    const val POD_SUBMITTED = "pod_submitted"
    const val EXPENSE_LOGGED = "expense_logged"
    const val DOCUMENT_UPLOADED = "document_uploaded"
    const val EXCEPTION_REPORTED = "exception_reported"
    const val CHECKPOINT_LOGGED = "checkpoint_logged"

    // ── Diagnostic Events ───────────────────────────────────────────────

    const val API_ERROR = "api_error"
    const val UPLOAD_FAILED = "upload_failed"
    const val SYNC_CONFLICT = "sync_conflict"
    const val GPS_SIGNAL_LOST = "gps_signal_lost"
    const val OFFLINE_QUEUE_DRAINED = "offline_queue_drained"
    const val OFFLINE_QUEUE_FAILED = "offline_queue_failed"

    /**
     * Build event parameters map for a trip action.
     */
    fun tripActionParams(
        tripId: Long,
        tripNumber: String = "",
        status: String = "",
        additionalParams: Map<String, String> = emptyMap(),
    ): Map<String, String> = buildMap {
        put("trip_id", tripId.toString())
        if (tripNumber.isNotBlank()) put("trip_number", tripNumber)
        if (status.isNotBlank()) put("status", status)
        putAll(additionalParams)
    }

    /**
     * Build event parameters map for a diagnostic event.
     */
    fun diagnosticParams(
        source: String,
        errorMessage: String = "",
        tripId: Long? = null,
        additionalParams: Map<String, String> = emptyMap(),
    ): Map<String, String> = buildMap {
        put("source", source)
        if (errorMessage.isNotBlank()) put("error_message", errorMessage)
        tripId?.let { put("trip_id", it.toString()) }
        putAll(additionalParams)
    }
}
