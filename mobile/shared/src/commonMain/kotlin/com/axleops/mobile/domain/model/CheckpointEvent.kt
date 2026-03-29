package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * An en-route checkpoint event logged by the driver during IN_TRANSIT.
 *
 * Source: spec Story 10, FR-090–FR-093
 *
 * Checkpoint events are **independent from expenses** (clarification Q3).
 * They are lightweight timeline markers for the audit trail, not financial records.
 */
@Serializable
data class CheckpointEvent(
    /** Server-assigned ID. 0 for locally-created. */
    val id: Long = 0,

    /** Trip this event belongs to. */
    @SerialName("trip_id")
    val tripId: Long,

    /** Type of checkpoint event. */
    val type: CheckpointEventType,

    /** ISO-8601 timestamp when the event occurred. */
    @SerialName("occurred_at")
    val occurredAt: String,

    /** GPS latitude at event. Null if GPS unavailable. */
    val latitude: Double? = null,

    /** GPS longitude at event. Null if GPS unavailable. */
    val longitude: Double? = null,

    // ── Context-Specific Fields ──────────────────────────────────────────

    /** Amount associated with this event (e.g., toll amount, fuel cost). Optional. */
    val amount: Double? = null,

    /** Fuel quantity in litres. Only for FUEL_STOP type. */
    @SerialName("fuel_litres")
    val fuelLitres: Double? = null,

    /** Price per litre. Only for FUEL_STOP type. */
    @SerialName("price_per_litre")
    val pricePerLitre: Double? = null,

    /** Location name (e.g., toll plaza name, rest stop name). Optional. */
    @SerialName("location_name")
    val locationName: String? = null,

    /** Free-form notes. Optional. */
    val notes: String? = null,

    // ── Sync & Audit ─────────────────────────────────────────────────────

    /** Sync status for offline-created events. */
    @SerialName("sync_status")
    val syncStatus: SyncStatus = SyncStatus.SYNCED,

    /** Who logged this event. */
    @SerialName("logged_by")
    val loggedBy: Long? = null,
)

/**
 * Types of en-route checkpoint events.
 *
 * Source: spec Story 10, acceptance scenario 2
 */
@Serializable
enum class CheckpointEventType(val displayLabel: String) {
    @SerialName("FUEL_STOP") FUEL_STOP("Fuel Stop"),
    @SerialName("TOLL") TOLL("Toll"),
    @SerialName("REST_HALT") REST_HALT("Rest Halt"),
    @SerialName("MEAL") MEAL("Meal"),
    @SerialName("INCIDENT") INCIDENT("Incident"),
    @SerialName("OTHER") OTHER("Other"),
}
