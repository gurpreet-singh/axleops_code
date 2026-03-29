package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * An expense entry logged by the driver during a trip.
 *
 * Source: spec Story 8, FR-070–FR-077
 *
 * Expenses are independent from checkpoint events (clarification Q3).
 * Editable/deletable until POD_SUBMITTED (clarification Q4).
 * Deletion is soft-delete (audit trail preserved).
 */
@Serializable
data class TripExpense(
    /** Server-assigned ID. 0 for locally-created, unsynced entries. */
    val id: Long = 0,

    /** Trip this expense belongs to. */
    @SerialName("trip_id")
    val tripId: Long,

    /** Expense category. */
    val category: ExpenseCategory,

    /** Amount in INR (₹). */
    val amount: Double,

    /** Optional description / notes. */
    val description: String? = null,

    /** ISO-8601 timestamp when logged. */
    @SerialName("logged_at")
    val loggedAt: String,

    /** Receipt file ID (from UploadService). Null if no receipt attached. */
    @SerialName("receipt_file_id")
    val receiptFileId: String? = null,

    /** Receipt thumbnail URL for display. Null if no receipt. */
    @SerialName("receipt_thumbnail_url")
    val receiptThumbnailUrl: String? = null,

    // ── Fuel-Specific Fields ─────────────────────────────────────────────

    /** Fuel quantity in litres. Only for FUEL category. */
    @SerialName("fuel_litres")
    val fuelLitres: Double? = null,

    /** Price per litre. Only for FUEL category. */
    @SerialName("price_per_litre")
    val pricePerLitre: Double? = null,

    /** Odometer reading at time of fueling. Only for FUEL category. */
    @SerialName("odometer_reading")
    val odometerReading: Double? = null,

    // ── Sync & Audit ─────────────────────────────────────────────────────

    /** Sync status for offline-created entries. */
    @SerialName("sync_status")
    val syncStatus: SyncStatus = SyncStatus.SYNCED,

    /** Whether this entry has been soft-deleted. */
    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    /** Who created this entry. */
    @SerialName("created_by")
    val createdBy: Long? = null,

    /** ISO-8601 timestamp of last edit. Null if never edited. */
    @SerialName("last_edited_at")
    val lastEditedAt: String? = null,
)

/**
 * Expense categories available to the driver.
 *
 * Source: spec Story 8, acceptance scenario 2
 */
@Serializable
enum class ExpenseCategory(val displayLabel: String) {
    @SerialName("FUEL") FUEL("Fuel / Diesel"),
    @SerialName("TOLL") TOLL("Toll"),
    @SerialName("FOOD") FOOD("Driver Food"),
    @SerialName("LOADING_UNLOADING") LOADING_UNLOADING("Loading / Unloading"),
    @SerialName("MAINTENANCE") MAINTENANCE("Maintenance / Repair"),
    @SerialName("MISCELLANEOUS") MISCELLANEOUS("Miscellaneous"),
}

/**
 * Sync status for locally-created or locally-modified records.
 */
@Serializable
enum class SyncStatus {
    /** Successfully synced to the server. */
    @SerialName("SYNCED") SYNCED,
    /** Created or modified locally, not yet synced. */
    @SerialName("PENDING") PENDING,
    /** Sync attempted but failed. Will retry. */
    @SerialName("FAILED") FAILED,
}
