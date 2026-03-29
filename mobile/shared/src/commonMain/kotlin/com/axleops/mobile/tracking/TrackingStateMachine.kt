package com.axleops.mobile.tracking

import com.axleops.mobile.tracking.model.TrackingState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Pure state machine for tracking lifecycle management.
 *
 * All valid transitions are defined explicitly. Invalid transitions
 * are logged but do NOT crash — they are silently ignored to prevent
 * UI disruption in field conditions.
 *
 * The state machine is the single source of truth for the current
 * tracking state. The [TrackingManager] delegates all state decisions
 * to this class.
 *
 * ## Valid Transitions
 *
 * ```
 * INACTIVE ──[onTripDeparted]──→ AWAITING_PERMISSION
 *
 * AWAITING_PERMISSION ──[onPermissionGranted(full=true)]──→ ACTIVE
 * AWAITING_PERMISSION ──[onPermissionGranted(full=false)]──→ ACTIVE_DEGRADED
 * AWAITING_PERMISSION ──[onPermissionDenied]──→ PERMISSION_DENIED
 *
 * ACTIVE ──[onGpsSignalLost]──→ SIGNAL_LOST
 * ACTIVE ──[onPermissionRevoked]──→ PERMISSION_DENIED
 * ACTIVE ──[onBackgroundRestricted]──→ ACTIVE_DEGRADED
 * ACTIVE ──[onTripArrived]──→ STOPPED
 *
 * ACTIVE_DEGRADED ──[onBackgroundRestored]──→ ACTIVE
 * ACTIVE_DEGRADED ──[onGpsSignalLost]──→ SIGNAL_LOST
 * ACTIVE_DEGRADED ──[onPermissionRevoked]──→ PERMISSION_DENIED
 * ACTIVE_DEGRADED ──[onTripArrived]──→ STOPPED
 *
 * SIGNAL_LOST ──[onGpsSignalRestored]──→ ACTIVE
 * SIGNAL_LOST ──[onPermissionRevoked]──→ PERMISSION_DENIED
 * SIGNAL_LOST ──[onTripArrived]──→ STOPPED
 *
 * PERMISSION_DENIED ──[onPermissionGranted(full)]──→ ACTIVE or ACTIVE_DEGRADED
 * PERMISSION_DENIED ──[onTripArrived]──→ STOPPED
 *
 * STOPPED ──[onTripReset]──→ INACTIVE
 *
 * Any ──[onTripReset]──→ INACTIVE (reset from any state)
 * Any ──[onTripArrived]──→ STOPPED (stop from any active/attempted state)
 * ```
 *
 * Source: UX tracking-state-inventory.md, plan §5
 */
class TrackingStateMachine {

    private val _state = MutableStateFlow(TrackingState.INACTIVE)

    /** Observable tracking state. UI observes this to render indicators and banners. */
    val state: StateFlow<TrackingState> = _state.asStateFlow()

    /** Current state value (non-flow access for logic checks). */
    val currentState: TrackingState get() = _state.value

    // ---- Transition methods ----

    /**
     * Trip has departed — tracking is requested.
     * Valid from: INACTIVE
     */
    fun onTripDeparted() {
        transition(
            from = setOf(TrackingState.INACTIVE),
            to = TrackingState.AWAITING_PERMISSION,
            event = "onTripDeparted",
        )
    }

    /**
     * Location permission was granted.
     *
     * @param fullAccess true if both foreground + background granted.
     *   false if foreground-only or reduced accuracy.
     *
     * Valid from: AWAITING_PERMISSION, PERMISSION_DENIED
     */
    fun onPermissionGranted(fullAccess: Boolean) {
        val target = if (fullAccess) TrackingState.ACTIVE else TrackingState.ACTIVE_DEGRADED
        transition(
            from = setOf(TrackingState.AWAITING_PERMISSION, TrackingState.PERMISSION_DENIED),
            to = target,
            event = "onPermissionGranted(fullAccess=$fullAccess)",
        )
    }

    /**
     * Location permission was denied by the driver.
     * Valid from: AWAITING_PERMISSION
     */
    fun onPermissionDenied() {
        transition(
            from = setOf(TrackingState.AWAITING_PERMISSION),
            to = TrackingState.PERMISSION_DENIED,
            event = "onPermissionDenied",
        )
    }

    /**
     * Location permission was revoked (via system Settings) while tracking.
     * Valid from: ACTIVE, ACTIVE_DEGRADED, SIGNAL_LOST
     */
    fun onPermissionRevoked() {
        transition(
            from = setOf(
                TrackingState.ACTIVE,
                TrackingState.ACTIVE_DEGRADED,
                TrackingState.SIGNAL_LOST,
            ),
            to = TrackingState.PERMISSION_DENIED,
            event = "onPermissionRevoked",
        )
    }

    /**
     * Background location access was restricted (e.g., iOS downgraded to WhenInUse,
     * or Android background permission revoked while foreground remains).
     * Valid from: ACTIVE
     */
    fun onBackgroundRestricted() {
        transition(
            from = setOf(TrackingState.ACTIVE),
            to = TrackingState.ACTIVE_DEGRADED,
            event = "onBackgroundRestricted",
        )
    }

    /**
     * Background location access was restored (e.g., user re-granted Always permission).
     * Valid from: ACTIVE_DEGRADED
     */
    fun onBackgroundRestored() {
        transition(
            from = setOf(TrackingState.ACTIVE_DEGRADED),
            to = TrackingState.ACTIVE,
            event = "onBackgroundRestored",
        )
    }

    /**
     * GPS hardware has not provided a fix for ≥ 2 consecutive intervals (10 min).
     * Valid from: ACTIVE, ACTIVE_DEGRADED
     */
    fun onGpsSignalLost() {
        transition(
            from = setOf(TrackingState.ACTIVE, TrackingState.ACTIVE_DEGRADED),
            to = TrackingState.SIGNAL_LOST,
            event = "onGpsSignalLost",
        )
    }

    /**
     * GPS fix re-acquired after a signal loss period.
     * Valid from: SIGNAL_LOST
     */
    fun onGpsSignalRestored() {
        transition(
            from = setOf(TrackingState.SIGNAL_LOST),
            to = TrackingState.ACTIVE,
            event = "onGpsSignalRestored",
        )
    }

    /**
     * Trip arrived at destination — tracking stops.
     * Valid from: any state except INACTIVE and STOPPED (idempotent for those).
     */
    fun onTripArrived() {
        val current = _state.value
        if (current == TrackingState.INACTIVE || current == TrackingState.STOPPED) {
            // Already not tracking — no-op
            return
        }
        transition(
            from = setOf(
                TrackingState.AWAITING_PERMISSION,
                TrackingState.ACTIVE,
                TrackingState.ACTIVE_DEGRADED,
                TrackingState.SIGNAL_LOST,
                TrackingState.PERMISSION_DENIED,
            ),
            to = TrackingState.STOPPED,
            event = "onTripArrived",
        )
    }

    /**
     * Trip context reset — return to idle. Used when:
     * - Trip is completed/settled
     * - Driver signs out
     * - A new trip is loaded
     *
     * Valid from: ANY state (unconditional reset).
     */
    fun onTripReset() {
        val previous = _state.value
        _state.value = TrackingState.INACTIVE
        if (previous != TrackingState.INACTIVE) {
            logTransition(previous, TrackingState.INACTIVE, "onTripReset")
        }
    }

    // ---- Internal ----

    /**
     * Execute a validated state transition.
     *
     * @param from Set of valid source states for this transition.
     * @param to The target state.
     * @param event Name of the transition event (for logging).
     */
    private fun transition(
        from: Set<TrackingState>,
        to: TrackingState,
        event: String,
    ) {
        val current = _state.value
        if (current !in from) {
            // Invalid transition — log and ignore. Never crash in the field.
            println(
                "[TrackingStateMachine] INVALID transition: $event " +
                    "from $current (expected one of $from) → $to — ignoring"
            )
            return
        }
        _state.value = to
        logTransition(current, to, event)
    }

    private fun logTransition(from: TrackingState, to: TrackingState, event: String) {
        println("[TrackingStateMachine] $event: $from → $to")
    }
}
