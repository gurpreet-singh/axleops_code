package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A single milestone in the trip's 10-step lifecycle.
 *
 * Source: [trip.md §2.2](file:///Users/ankit/a/fleetly/axleops_code/trip.md)
 * Each milestone captures what happened, when, where, and evidence.
 *
 * Milestones are returned by `GET /trips/{id}/milestones` (derived contract).
 */
@Serializable
data class Milestone(
    /** Server-assigned ID. */
    val id: Long = 0,

    /** The milestone type in the lifecycle sequence. */
    val type: MilestoneType,

    /** 1-based position in the trip lifecycle (1 = DISPATCHED, 10 = POD_SUBMITTED). */
    @SerialName("sequence_number")
    val sequenceNumber: Int,

    /** Current status of this milestone. */
    val status: MilestoneStatus = MilestoneStatus.UPCOMING,

    /** ISO-8601 timestamp when this milestone was completed. Null if not yet reached. */
    @SerialName("completed_at")
    val completedAt: String? = null,

    /** GPS latitude captured at milestone completion. Null if GPS unavailable. */
    val latitude: Double? = null,

    /** GPS longitude captured at milestone completion. Null if GPS unavailable. */
    val longitude: Double? = null,

    /** GPS accuracy in meters. Null if GPS unavailable. */
    @SerialName("gps_accuracy")
    val gpsAccuracy: Double? = null,

    /** Key-value data captured at this milestone (e.g., weight, seal number). */
    @SerialName("captured_data")
    val capturedData: Map<String, String> = emptyMap(),

    /** IDs of evidence files (photos, documents) attached to this milestone. */
    @SerialName("evidence_ids")
    val evidenceIds: List<String> = emptyList(),

    /** User ID of who completed this milestone. */
    @SerialName("completed_by")
    val completedBy: Long? = null,
)

/**
 * Status of a single milestone within the trip lifecycle.
 */
@Serializable
enum class MilestoneStatus {
    /** Not yet reached in the sequence. */
    @SerialName("UPCOMING") UPCOMING,

    /** Currently the active milestone — the driver can act on it. */
    @SerialName("CURRENT") CURRENT,

    /** Successfully completed with timestamp and optional evidence. */
    @SerialName("COMPLETED") COMPLETED,

    /** Skipped (e.g., template doesn't require this milestone). */
    @SerialName("SKIPPED") SKIPPED,

    /** Blocked by a guard condition (e.g., EWB not ready). */
    @SerialName("BLOCKED") BLOCKED,
}
