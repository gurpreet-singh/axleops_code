package com.axleops.mobile.domain.model

/**
 * Driver-visible presentation metadata for each [TripStatus].
 *
 * Bridges from the domain sub-state to UX-layer rendering needs:
 * - [label]: driver-facing text (from state-inventory.md §1)
 * - [badgeColorToken]: design-system token name for badge background
 * - [phase]: the [TripPhase] this sub-state belongs to
 *
 * This object is **pure Kotlin** — no Compose or platform imports.
 * The Compose layer resolves [badgeColorToken] to the matching
 * `ui.theme.TripPhase` color or semantic color.
 *
 * Source: [state-inventory.md](file:///Users/ankit/a/fleetly/axleops_code/specs/005-driver-active-trip/ux/state-inventory.md) §1–§2
 */
data class TripSubStateInfo(
    /** Driver-facing label, e.g. "At Loading Point". Null if not driver-visible. */
    val label: String?,
    /** Design token name, e.g. "color.phase.in_transit" or "color.warning". */
    val badgeColorToken: String,
    /** Coarse phase grouping. */
    val phase: TripPhase,
)

/**
 * Maps every [TripStatus] to its driver-visible presentation metadata.
 *
 * This is the single mapping table between domain sub-states and
 * UX presentation. All badge rendering, stepper coloring, and card
 * labeling should derive from this lookup.
 */
object TripSubState {

    /**
     * Returns the [TripSubStateInfo] for a given [TripStatus].
     */
    fun infoFor(status: TripStatus): TripSubStateInfo = when (status) {
        // Phase 1: Created
        TripStatus.DRAFT -> TripSubStateInfo(null, "color.phase.created", TripPhase.CREATED)
        TripStatus.CREATED -> TripSubStateInfo(null, "color.phase.created", TripPhase.CREATED)
        TripStatus.DISPATCHED -> TripSubStateInfo("Trip Dispatched", "color.phase.created", TripPhase.CREATED)
        TripStatus.ACCEPTED -> TripSubStateInfo("Trip Accepted", "color.phase.in_transit", TripPhase.CREATED)

        // Phase 2: In Transit
        TripStatus.AT_ORIGIN -> TripSubStateInfo("At Loading Point", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.LOADING -> TripSubStateInfo("Loading", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.LOADED -> TripSubStateInfo("Loaded — Ready to Depart", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.EWB_PENDING -> TripSubStateInfo("Awaiting E-Way Bill", "color.warning", TripPhase.IN_TRANSIT)
        TripStatus.DEPARTED -> TripSubStateInfo("Departed", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.IN_TRANSIT -> TripSubStateInfo("In Transit", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.AT_CHECKPOINT -> TripSubStateInfo("At Checkpoint", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.AT_DESTINATION -> TripSubStateInfo("Arrived at Destination", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.UNLOADING -> TripSubStateInfo("Unloading", "color.phase.in_transit", TripPhase.IN_TRANSIT)
        TripStatus.DELIVERED -> TripSubStateInfo("Delivered", "color.phase.in_transit", TripPhase.IN_TRANSIT)

        // Phase 3: Completed
        TripStatus.POD_SUBMITTED -> TripSubStateInfo("POD Submitted", "color.phase.completed", TripPhase.COMPLETED)
        TripStatus.POD_VERIFIED -> TripSubStateInfo("Trip Complete", "color.phase.completed", TripPhase.COMPLETED)
        TripStatus.POD_DISPUTED -> TripSubStateInfo("POD Under Review", "color.warning", TripPhase.COMPLETED)
        TripStatus.COMPLETED -> TripSubStateInfo("Trip Complete", "color.phase.completed", TripPhase.COMPLETED)

        // Phase 4: Settled
        TripStatus.SETTLED -> TripSubStateInfo("Trip Settled", "color.phase.settled", TripPhase.SETTLED)

        // Exception states
        TripStatus.DRIVER_REJECTED -> TripSubStateInfo(null, "color.phase.created", TripPhase.CREATED)
        TripStatus.VEHICLE_BREAKDOWN -> TripSubStateInfo("Vehicle Breakdown", "color.phase.exception", TripPhase.IN_TRANSIT)
        TripStatus.ACCIDENT -> TripSubStateInfo("Accident Reported", "color.error", TripPhase.IN_TRANSIT)
        TripStatus.LOAD_TRANSFER -> TripSubStateInfo("Load Transfer", "color.phase.exception", TripPhase.IN_TRANSIT)
        TripStatus.ROUTE_BLOCKED -> TripSubStateInfo("Route Blocked", "color.phase.exception", TripPhase.IN_TRANSIT)
        TripStatus.CARGO_DAMAGE -> TripSubStateInfo("Cargo Damage", "color.phase.exception", TripPhase.IN_TRANSIT)
        TripStatus.CARGO_SHORTAGE -> TripSubStateInfo("Cargo Shortage", "color.phase.exception", TripPhase.IN_TRANSIT)
        TripStatus.DELIVERY_REJECTED -> TripSubStateInfo("Delivery Refused", "color.error", TripPhase.IN_TRANSIT)
        TripStatus.EWB_EXPIRED -> TripSubStateInfo("E-Way Bill Expired", "color.error", TripPhase.IN_TRANSIT)
        TripStatus.GPS_LOST -> TripSubStateInfo("GPS Signal Lost", "color.warning", TripPhase.IN_TRANSIT)
        TripStatus.CANCELLED -> TripSubStateInfo("Trip Cancelled", "color.phase.settled", TripPhase.SETTLED)
        TripStatus.TRANSFERRED -> TripSubStateInfo("Trip Transferred", "color.phase.settled", TripPhase.SETTLED)

        // Forward compat
        TripStatus.UNKNOWN -> TripSubStateInfo("Status Unknown", "color.phase.settled", TripPhase.SETTLED)
    }
}
