package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Role-agnostic Trip domain model.
 *
 * Derived from the backend `Trip` entity shape. This model
 * is used by both Driver and future roles (e.g., Operations Executive)
 * — role-specific filtering happens at the query/ViewModel layer,
 * not in the model itself.
 *
 * Fields match the closest backend contract for `GET /trips`.
 */
@Serializable
data class Trip(
    val id: Long,

    @SerialName("trip_number")
    val tripNumber: String = "",

    val status: TripStatus = TripStatus.CREATED,

    @SerialName("origin_city")
    val originCity: String = "",

    @SerialName("destination_city")
    val destinationCity: String = "",

    @SerialName("start_date")
    val startDate: String? = null,

    @SerialName("end_date")
    val endDate: String? = null,

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

    @SerialName("total_distance_km")
    val totalDistanceKm: Double? = null,

    @SerialName("freight_amount")
    val freightAmount: Double? = null,
)

/**
 * Trip lifecycle phases — the 4 high-level phases from trip.md §2.1.
 *
 * Used as a coarse grouping for UI badge coloring and section visibility.
 */
enum class TripPhase {
    CREATED,
    IN_TRANSIT,
    COMPLETED,
    SETTLED,
}

/**
 * Trip lifecycle sub-states — the full operational sub-state model.
 *
 * Source of truth: [trip.md](file:///Users/ankit/a/fleetly/axleops_code/trip.md) §2.2–§2.3
 * UX mapping: [state-inventory.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/ux/state-inventory.md)
 *
 * Breakdown:
 * - 4 Phase 1 sub-states (DRAFT → ACCEPTED)
 * - 10 Phase 2 sub-states (AT_ORIGIN → DELIVERED)
 * - 3 Phase 3 sub-states (POD_SUBMITTED → POD_DISPUTED)
 * - 1 Phase 4 sub-state (SETTLED)
 * - 10 Exception overlay states (DRIVER_REJECTED → TRANSFERRED)
 * - 1 UNKNOWN fallback for forward compatibility
 *
 * Backend note: The backend `Trip.java` uses a plain `String status`. Values
 * here match the string values from trip.md. If the backend sends a value
 * not in this enum, kotlinx.serialization will throw — callers should use
 * [safeDeserialize] or handle exceptions to fall back to [UNKNOWN].
 */
@Serializable
enum class TripStatus {

    // ── Phase 1: Created (Setup & Dispatch) ──────────────────────────────

    /** Trip form started but incomplete. Not visible to driver. */
    @SerialName("DRAFT") DRAFT,

    /** All required fields filled, trip saved. Not visible to driver. */
    @SerialName("CREATED") CREATED,

    /** Trip assigned and sent to driver. Driver sees "Trip Dispatched". */
    @SerialName("DISPATCHED") DISPATCHED,

    /** Driver accepted via mobile app. Driver sees "Trip Accepted". */
    @SerialName("ACCEPTED") ACCEPTED,

    // ── Phase 2: In Transit (Execution) ──────────────────────────────────

    /** Driver arrived at loading point. Driver sees "At Loading Point". */
    @SerialName("AT_ORIGIN") AT_ORIGIN,

    /** Cargo loading in progress. Driver sees "Loading". */
    @SerialName("LOADING") LOADING,

    /** Loading complete, weight verified. Driver sees "Loaded — Ready to Depart". */
    @SerialName("LOADED") LOADED,

    /** Waiting for E-Way Bill generation. Driver sees "Awaiting E-Way Bill". */
    @SerialName("EWB_PENDING") EWB_PENDING,

    /** Vehicle left loading point. Driver sees "Departed". GPS tracking starts. */
    @SerialName("DEPARTED") DEPARTED,

    /** Vehicle actively moving on route. Driver sees "In Transit". */
    @SerialName("IN_TRANSIT") IN_TRANSIT,

    /** At intermediate stop (multi-stop only, future). Driver sees "At Checkpoint". */
    @SerialName("AT_CHECKPOINT") AT_CHECKPOINT,

    /** Arrived at delivery point. Driver sees "Arrived at Destination". */
    @SerialName("AT_DESTINATION") AT_DESTINATION,

    /** Cargo unloading in progress. Driver sees "Unloading". */
    @SerialName("UNLOADING") UNLOADING,

    /** Unloading complete, cargo handed over. Driver sees "Delivered". */
    @SerialName("DELIVERED") DELIVERED,

    // ── Phase 3: Completed (Verification) ────────────────────────────────

    /** Driver uploaded POD. Driver sees "POD Submitted". Read-only. */
    @SerialName("POD_SUBMITTED") POD_SUBMITTED,

    /** Operations verified POD. Driver sees "Trip Complete". Read-only. */
    @SerialName("POD_VERIFIED") POD_VERIFIED,

    /**
     * POD verification failed, dispute raised. Driver sees "POD Under Review".
     * Read-only — per clarification Q5, resubmission is deferred to a future feature.
     */
    @SerialName("POD_DISPUTED") POD_DISPUTED,

    /**
     * Legacy alias: the existing backend may send "COMPLETED" for trips
     * that have reached POD_VERIFIED. Kept for backward compatibility
     * with the original 6-value enum.
     */
    @SerialName("COMPLETED") COMPLETED,

    // ── Phase 4: Settled (Closure) ───────────────────────────────────────

    /** Financial settlement calculated, revenue locked. Read-only. */
    @SerialName("SETTLED") SETTLED,

    // ── Exception Overlay States ─────────────────────────────────────────
    //
    // These overlay normal flow. When active, they suppress normal CTA
    // buttons and show an exception banner. See state-inventory.md §2.

    /** Driver declined the dispatched trip. Ops reassigns. */
    @SerialName("DRIVER_REJECTED") DRIVER_REJECTED,

    /** Mechanical failure during transit. All driver actions disabled. */
    @SerialName("VEHICLE_BREAKDOWN") VEHICLE_BREAKDOWN,

    /** Accident reported. All driver actions disabled. Critical alert. */
    @SerialName("ACCIDENT") ACCIDENT,

    /** Cargo transferred to replacement vehicle. Terminal for parent trip. */
    @SerialName("LOAD_TRANSFER") LOAD_TRANSFER,

    /** Road block / closure. All driver actions disabled. */
    @SerialName("ROUTE_BLOCKED") ROUTE_BLOCKED,

    /** Damage detected during transit. All driver actions disabled. */
    @SerialName("CARGO_DAMAGE") CARGO_DAMAGE,

    /** Quantity mismatch at delivery. Milestone actions disabled. */
    @SerialName("CARGO_SHORTAGE") CARGO_SHORTAGE,

    /** Receiver refused delivery. All driver actions disabled. */
    @SerialName("DELIVERY_REJECTED") DELIVERY_REJECTED,

    /** E-Way Bill validity lapsed. Vehicle must halt. */
    @SerialName("EWB_EXPIRED") EWB_EXPIRED,

    /** GPS signal lost. Warning only — actions NOT blocked. */
    @SerialName("GPS_LOST") GPS_LOST,

    /** Trip cancelled from any pre-delivery state. Terminal. */
    @SerialName("CANCELLED") CANCELLED,

    /** Parent trip replaced by child trip after load transfer. Terminal. */
    @SerialName("TRANSFERRED") TRANSFERRED,

    // ── Forward Compatibility ────────────────────────────────────────────

    /**
     * Unknown / unmapped backend value.
     *
     * If the backend sends a status string not in this enum, the mapper
     * or deserializer should fall back to UNKNOWN rather than crashing.
     * The driver sees "Status Unknown" and no CTA is shown.
     */
    @SerialName("UNKNOWN") UNKNOWN,
    ;

    // ── Computed Properties ──────────────────────────────────────────────

    /**
     * The high-level trip phase this sub-state belongs to.
     *
     * Exception states map to the phase they typically occur in,
     * with transit exceptions mapping to [TripPhase.IN_TRANSIT].
     */
    val phase: TripPhase
        get() = when (this) {
            DRAFT, CREATED, DISPATCHED, ACCEPTED,
            DRIVER_REJECTED -> TripPhase.CREATED

            AT_ORIGIN, LOADING, LOADED, EWB_PENDING, DEPARTED,
            IN_TRANSIT, AT_CHECKPOINT, AT_DESTINATION, UNLOADING, DELIVERED,
            VEHICLE_BREAKDOWN, ACCIDENT, LOAD_TRANSFER, ROUTE_BLOCKED,
            CARGO_DAMAGE, CARGO_SHORTAGE, DELIVERY_REJECTED,
            EWB_EXPIRED, GPS_LOST -> TripPhase.IN_TRANSIT

            POD_SUBMITTED, POD_VERIFIED, POD_DISPUTED,
            COMPLETED -> TripPhase.COMPLETED

            SETTLED -> TripPhase.SETTLED

            CANCELLED, TRANSFERRED, UNKNOWN -> TripPhase.SETTLED
        }

    /**
     * Driver-facing label for this sub-state.
     *
     * Maps 1:1 to the "Driver Label" column in state-inventory.md §1.
     * Returns null for states not visible to the driver (DRAFT, CREATED).
     */
    val driverLabel: String?
        get() = when (this) {
            DRAFT -> null
            CREATED -> null
            DISPATCHED -> "Trip Dispatched"
            ACCEPTED -> "Trip Accepted"
            AT_ORIGIN -> "At Loading Point"
            LOADING -> "Loading"
            LOADED -> "Loaded — Ready to Depart"
            EWB_PENDING -> "Awaiting E-Way Bill"
            DEPARTED -> "Departed"
            IN_TRANSIT -> "In Transit"
            AT_CHECKPOINT -> "At Checkpoint"
            AT_DESTINATION -> "Arrived at Destination"
            UNLOADING -> "Unloading"
            DELIVERED -> "Delivered"
            POD_SUBMITTED -> "POD Submitted"
            POD_VERIFIED -> "Trip Complete"
            POD_DISPUTED -> "POD Under Review"
            COMPLETED -> "Trip Complete"
            SETTLED -> "Trip Settled"
            DRIVER_REJECTED -> null
            VEHICLE_BREAKDOWN -> "Vehicle Breakdown"
            ACCIDENT -> "Accident Reported"
            LOAD_TRANSFER -> "Load Transfer"
            ROUTE_BLOCKED -> "Route Blocked"
            CARGO_DAMAGE -> "Cargo Damage"
            CARGO_SHORTAGE -> "Cargo Shortage"
            DELIVERY_REJECTED -> "Delivery Refused"
            EWB_EXPIRED -> "E-Way Bill Expired"
            GPS_LOST -> "GPS Signal Lost"
            CANCELLED -> "Trip Cancelled"
            TRANSFERRED -> "Trip Transferred"
            UNKNOWN -> "Status Unknown"
        }

    /**
     * Whether this sub-state is visible to the driver in the mobile app.
     *
     * DRAFT and CREATED are ops-internal. DRIVER_REJECTED exits the
     * driver's view (trip returns to ops). All others are visible.
     */
    val isDriverVisible: Boolean
        get() = when (this) {
            DRAFT, CREATED, DRIVER_REJECTED -> false
            else -> true
        }

    /**
     * Whether this sub-state is read-only for the driver (no CTA button).
     *
     * Post-POD states, settled, cancelled, transferred, and unknown are
     * all read-only. The driver can view trip details but cannot take actions.
     */
    val isReadOnly: Boolean
        get() = when (this) {
            POD_SUBMITTED, POD_VERIFIED, POD_DISPUTED,
            COMPLETED, SETTLED, CANCELLED, TRANSFERRED, UNKNOWN -> true
            else -> false
        }

    /**
     * Whether this sub-state is an exception overlay.
     *
     * Exception states suppress normal CTA buttons and show an exception
     * banner. See state-inventory.md §2 for the full exception table.
     *
     * Note: GPS_LOST is an exception but does NOT block driver actions.
     */
    val isException: Boolean
        get() = when (this) {
            VEHICLE_BREAKDOWN, ACCIDENT, LOAD_TRANSFER, ROUTE_BLOCKED,
            CARGO_DAMAGE, CARGO_SHORTAGE, DELIVERY_REJECTED,
            EWB_EXPIRED, GPS_LOST -> true
            else -> false
        }

    /**
     * Whether this exception blocks ALL driver actions (CTA disabled).
     *
     * GPS_LOST is an exception but does NOT block actions.
     * CARGO_SHORTAGE blocks milestone actions only (handled separately).
     */
    val isBlockingException: Boolean
        get() = when (this) {
            VEHICLE_BREAKDOWN, ACCIDENT, LOAD_TRANSFER, ROUTE_BLOCKED,
            CARGO_DAMAGE, DELIVERY_REJECTED, EWB_EXPIRED -> true
            else -> false
        }

    /**
     * Whether this is a terminal state (no further transitions possible).
     */
    val isTerminal: Boolean
        get() = when (this) {
            SETTLED, CANCELLED, TRANSFERRED, DRIVER_REJECTED -> true
            else -> false
        }

    companion object {
        /**
         * Safe deserialization from a raw status string.
         *
         * Returns the matching [TripStatus] or [UNKNOWN] if the string
         * doesn't match any known value. Use this instead of [valueOf]
         * to avoid crashes on unknown backend values.
         */
        fun fromString(raw: String): TripStatus =
            entries.firstOrNull { it.name == raw } ?: UNKNOWN
    }
}
