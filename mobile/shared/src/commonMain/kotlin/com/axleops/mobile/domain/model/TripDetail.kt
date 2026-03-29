package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Enriched trip model for the Active Trip detail screen.
 *
 * Combines the base [Trip] fields with milestones, expenses, documents,
 * exception state, POD status, and budget data. This is the single
 * model backing the `TripDetailScreen`.
 *
 * Source: spec FR-010 through FR-013, plan §2
 */
@Serializable
data class TripDetail(
    // ── Core Trip Fields ─────────────────────────────────────────────────

    val id: Long,

    @SerialName("trip_number")
    val tripNumber: String = "",

    val status: TripStatus = TripStatus.CREATED,

    @SerialName("origin_city")
    val originCity: String = "",

    @SerialName("destination_city")
    val destinationCity: String = "",

    @SerialName("origin_address")
    val originAddress: String? = null,

    @SerialName("destination_address")
    val destinationAddress: String? = null,

    @SerialName("origin_lat")
    val originLat: Double? = null,

    @SerialName("origin_lng")
    val originLng: Double? = null,

    @SerialName("destination_lat")
    val destinationLat: Double? = null,

    @SerialName("destination_lng")
    val destinationLng: Double? = null,

    @SerialName("start_date")
    val startDate: String? = null,

    @SerialName("end_date")
    val endDate: String? = null,

    @SerialName("expected_delivery_date")
    val expectedDeliveryDate: String? = null,

    // ── Participants ─────────────────────────────────────────────────────

    @SerialName("driver_id")
    val driverId: Long? = null,

    @SerialName("driver_name")
    val driverName: String? = null,

    @SerialName("vehicle_id")
    val vehicleId: Long? = null,

    @SerialName("vehicle_number")
    val vehicleNumber: String? = null,

    @SerialName("branch_id")
    val branchId: Long? = null,

    @SerialName("customer_name")
    val customerName: String? = null,

    // ── Cargo ────────────────────────────────────────────────────────────

    @SerialName("cargo_description")
    val cargoDescription: String? = null,

    @SerialName("booked_weight_mt")
    val bookedWeightMt: Double? = null,

    @SerialName("actual_weight_mt")
    val actualWeightMt: Double? = null,

    @SerialName("delivered_weight_mt")
    val deliveredWeightMt: Double? = null,

    @SerialName("consignment_value")
    val consignmentValue: Double? = null,

    @SerialName("lr_number")
    val lrNumber: String? = null,

    // ── Distance & Financials ────────────────────────────────────────────

    @SerialName("total_distance_km")
    val totalDistanceKm: Double? = null,

    @SerialName("freight_amount")
    val freightAmount: Double? = null,

    @SerialName("budget_estimate")
    val budgetEstimate: Double? = null,

    // ── Dispatch & Timing ────────────────────────────────────────────────

    @SerialName("dispatched_at")
    val dispatchedAt: String? = null,

    @SerialName("accepted_at")
    val acceptedAt: String? = null,

    @SerialName("accept_timeout_minutes")
    val acceptTimeoutMinutes: Int = 30,

    // ── Lifecycle Sub-Data ───────────────────────────────────────────────

    /** Milestones in the trip lifecycle. Ordered by sequence. */
    val milestones: List<Milestone> = emptyList(),

    /** Documents uploaded by the driver. */
    val documents: List<TripDocument> = emptyList(),

    /** Expenses logged by the driver. */
    val expenses: List<TripExpense> = emptyList(),

    /** Checkpoint events logged during transit. */
    @SerialName("checkpoint_events")
    val checkpointEvents: List<CheckpointEvent> = emptyList(),

    /** Active exception, if any. Null when no exception. */
    @SerialName("active_exception")
    val activeException: TripException? = null,

    /** POD data, if submitted. Null before submission. */
    val pod: Pod? = null,

    /** Seal number captured during loading. */
    @SerialName("seal_number")
    val sealNumber: String? = null,

    /** Cargo condition at delivery (Good / Damaged / Partial Damage). */
    @SerialName("cargo_condition")
    val cargoCondition: String? = null,
) {
    /**
     * Whether this trip is in a state where the driver can make changes.
     *
     * Returns false for read-only states (post-POD, settled, cancelled,
     * transferred, unknown).
     */
    val isEditable: Boolean
        get() = !status.isReadOnly

    /**
     * Whether this trip has an active exception that blocks driver actions.
     */
    val hasBlockingException: Boolean
        get() = activeException != null && status.isBlockingException

    /**
     * Running total of all expenses for this trip.
     */
    val totalExpenses: Double
        get() = expenses.sumOf { it.amount }

    /**
     * Budget utilization percentage (0.0–1.0+). Null if no budget set.
     */
    val budgetUtilization: Double?
        get() = budgetEstimate?.let { budget ->
            if (budget > 0.0) totalExpenses / budget else null
        }

    /**
     * Current milestone — the one with status CURRENT. Null if none.
     */
    val currentMilestone: Milestone?
        get() = milestones.firstOrNull { it.status == MilestoneStatus.CURRENT }

    /**
     * Number of completed milestones.
     */
    val completedMilestoneCount: Int
        get() = milestones.count { it.status == MilestoneStatus.COMPLETED }
}
