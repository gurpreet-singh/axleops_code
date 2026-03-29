package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.DriverAction
import com.axleops.mobile.domain.model.TripStatus

/**
 * Pure Kotlin state machine for the trip lifecycle.
 *
 * Validates whether a given [DriverAction] is permitted from a given
 * [TripStatus], and computes the next state. This is the single source
 * of truth for "what can the driver do right now" on the mobile side.
 *
 * The backend has its own state machine (trip.md section 4). This mobile-side
 * state machine mirrors the same transition table for:
 * 1. Optimistic UI updates (show new state immediately)
 * 2. Offline queue validation (don't enqueue impossible transitions)
 * 3. Mock repository state progression
 *
 * Source: trip.md section 2.2, section 4 (validated transitions)
 * UX: interaction-rules.md section 1
 */
object TripStateMachine {

    // ── Transition Table ─────────────────────────────────────────────────

    /**
     * Map of (current status, action) -> next status.
     *
     * Only entries in this map are valid transitions. Any combination
     * not present is an illegal transition.
     */
    private val transitions: Map<Pair<TripStatus, Class<out DriverAction>>, TripStatus> = mapOf(
        // Acceptance
        (TripStatus.DISPATCHED to DriverAction.Accept::class.java) to TripStatus.ACCEPTED,
        (TripStatus.DISPATCHED to DriverAction.Reject::class.java) to TripStatus.DRIVER_REJECTED,

        // Milestone progression
        (TripStatus.ACCEPTED to DriverAction.ArrivedAtOrigin::class.java) to TripStatus.AT_ORIGIN,
        (TripStatus.AT_ORIGIN to DriverAction.StartLoading::class.java) to TripStatus.LOADING,
        (TripStatus.LOADING to DriverAction.LoadingComplete::class.java) to TripStatus.LOADED,
        (TripStatus.LOADED to DriverAction.Depart::class.java) to TripStatus.DEPARTED,
        (TripStatus.DEPARTED to DriverAction.ArrivedAtDestination::class.java) to TripStatus.AT_DESTINATION,
        (TripStatus.IN_TRANSIT to DriverAction.ArrivedAtDestination::class.java) to TripStatus.AT_DESTINATION,
        (TripStatus.AT_DESTINATION to DriverAction.StartUnloading::class.java) to TripStatus.UNLOADING,
        (TripStatus.UNLOADING to DriverAction.DeliveryComplete::class.java) to TripStatus.DELIVERED,
        (TripStatus.DELIVERED to DriverAction.SubmitPod::class.java) to TripStatus.POD_SUBMITTED,
    )

    /**
     * Compute the next [TripStatus] for a given current status and action.
     *
     * @return The next status, or null if the transition is not allowed.
     */
    fun nextState(current: TripStatus, action: DriverAction): TripStatus? =
        transitions[current to action::class.java]

    /**
     * Check whether a given action is allowed from the current status.
     */
    fun isAllowed(current: TripStatus, action: DriverAction): Boolean =
        transitions.containsKey(current to action::class.java)

    /**
     * Get the single allowed [DriverAction] for a given status.
     *
     * Most states have exactly one valid forward action. Returns null
     * for states with no forward action (read-only, exception, terminal).
     * Returns null for DISPATCHED (which has two: Accept/Reject) since
     * that case requires explicit UI handling.
     */
    fun allowedAction(current: TripStatus): DriverAction? = when (current) {
        TripStatus.ACCEPTED -> DriverAction.ArrivedAtOrigin
        TripStatus.AT_ORIGIN -> DriverAction.StartLoading
        TripStatus.LOADING -> null // Requires payload (LoadingComplete), built by UI
        TripStatus.LOADED -> DriverAction.Depart
        TripStatus.DEPARTED -> DriverAction.ArrivedAtDestination
        TripStatus.IN_TRANSIT -> DriverAction.ArrivedAtDestination
        TripStatus.AT_DESTINATION -> DriverAction.StartUnloading
        TripStatus.UNLOADING -> null // Requires payload (DeliveryComplete), built by UI
        TripStatus.DELIVERED -> DriverAction.SubmitPod
        else -> null // Read-only, exception, terminal, or multi-action (DISPATCHED)
    }

    // ── Query Functions ──────────────────────────────────────────────────

    /**
     * Whether the driver is in the accept/reject decision phase.
     */
    fun isAcceptPhase(status: TripStatus): Boolean =
        status == TripStatus.DISPATCHED

    /**
     * Whether this status requires a form-based action (payload-bearing).
     *
     * For these states, the UI must present a form to collect data before
     * the action can be submitted (e.g., LoadingComplete needs weight).
     */
    fun requiresForm(status: TripStatus): Boolean = when (status) {
        TripStatus.LOADING,     // LoadingComplete: weight, seal, photos
        TripStatus.UNLOADING,   // DeliveryComplete: weight, condition
        TripStatus.DELIVERED,   // SubmitPod: multi-step flow
        -> true
        else -> false
    }

    /**
     * Whether the current status is blocked by an active exception.
     *
     * When true, the exception banner should be shown and the primary
     * CTA should be disabled (except for GPS_LOST which is warning-only).
     */
    fun isBlockedByException(status: TripStatus): Boolean =
        status.isBlockingException

    /**
     * Whether the current status is read-only (no driver actions allowed).
     */
    fun isReadOnly(status: TripStatus): Boolean =
        status.isReadOnly

    /**
     * Whether the current status is a terminal state.
     */
    fun isTerminal(status: TripStatus): Boolean =
        status.isTerminal

    /**
     * Whether the current status is an exception overlay.
     */
    fun isException(status: TripStatus): Boolean =
        status.isException

    /**
     * Whether GPS tracking should be active for this status.
     *
     * Tracking runs from DEPARTED through AT_DESTINATION (inclusive of IN_TRANSIT).
     * Source: spec FR-050
     */
    fun shouldTrackGps(status: TripStatus): Boolean = when (status) {
        TripStatus.DEPARTED,
        TripStatus.IN_TRANSIT,
        TripStatus.AT_CHECKPOINT,
        -> true
        else -> false
    }

    /**
     * Whether expenses and documents can be added in this status.
     *
     * Editable from ACCEPTED through DELIVERED. Read-only from POD_SUBMITTED onward.
     * Source: clarification Q4
     */
    fun canModifyRecords(status: TripStatus): Boolean =
        !status.isReadOnly && !status.isTerminal && status.isDriverVisible

    /**
     * All statuses that the driver will encounter in the normal
     * (non-exception) happy path, in order.
     */
    val happyPathStatuses: List<TripStatus> = listOf(
        TripStatus.DISPATCHED,
        TripStatus.ACCEPTED,
        TripStatus.AT_ORIGIN,
        TripStatus.LOADING,
        TripStatus.LOADED,
        TripStatus.DEPARTED,
        TripStatus.IN_TRANSIT,
        TripStatus.AT_DESTINATION,
        TripStatus.UNLOADING,
        TripStatus.DELIVERED,
        TripStatus.POD_SUBMITTED,
        TripStatus.POD_VERIFIED,
        TripStatus.SETTLED,
    )
}
