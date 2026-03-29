package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * An exception event reported by the driver during a trip.
 *
 * Source: spec Story 9, FR-080–FR-084, state-inventory.md §2
 *
 * When an exception is active, it overlays the normal trip flow:
 * the exception banner is shown and CTA actions are disabled
 * (except GPS_LOST which is warning-only).
 */
@Serializable
data class TripException(
    /** Server-assigned ID. 0 for locally-created. */
    val id: Long = 0,

    /** Trip this exception belongs to. */
    @SerialName("trip_id")
    val tripId: Long,

    /** Type of exception. */
    val type: ExceptionType,

    /** Driver-provided description. */
    val description: String = "",

    /** ISO-8601 timestamp when reported. */
    @SerialName("reported_at")
    val reportedAt: String,

    /** GPS latitude at time of report. Null if GPS unavailable. */
    val latitude: Double? = null,

    /** GPS longitude at time of report. Null if GPS unavailable. */
    val longitude: Double? = null,

    /** IDs of evidence photos attached to this report. */
    @SerialName("evidence_ids")
    val evidenceIds: List<String> = emptyList(),

    /** Whether this exception is currently active (not yet resolved by ops). */
    @SerialName("is_active")
    val isActive: Boolean = true,

    /** ISO-8601 timestamp when resolved. Null if still active. */
    @SerialName("resolved_at")
    val resolvedAt: String? = null,

    /** Resolution notes (from ops). Null if still active. */
    @SerialName("resolution_notes")
    val resolutionNotes: String? = null,

    /** Who reported this exception. */
    @SerialName("reported_by")
    val reportedBy: Long? = null,

    /** Sync status for offline-created exceptions. */
    @SerialName("sync_status")
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
)

/**
 * Exception types that a driver can report.
 *
 * Source: spec Story 9, trip.md §2.3
 * Note: DRIVER_UNREACHABLE is not self-reportable per acceptance scenario 1.
 */
@Serializable
enum class ExceptionType(val driverLabel: String) {
    @SerialName("VEHICLE_BREAKDOWN") VEHICLE_BREAKDOWN("Vehicle Breakdown"),
    @SerialName("ACCIDENT") ACCIDENT("Accident"),
    @SerialName("CARGO_DAMAGE") CARGO_DAMAGE("Cargo Damage"),
    @SerialName("CARGO_SHORTAGE") CARGO_SHORTAGE("Cargo Shortage"),
    @SerialName("ROUTE_BLOCKED") ROUTE_BLOCKED("Route Blocked"),
    @SerialName("OTHER") OTHER("Other"),
}
