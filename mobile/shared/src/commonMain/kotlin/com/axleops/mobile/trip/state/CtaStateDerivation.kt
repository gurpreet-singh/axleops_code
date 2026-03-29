package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus

/**
 * Pure function: derives [CtaState] from a [TripDetail].
 *
 * This is the single source of truth for what CTA button to show
 * on any trip screen. All screens delegate to this function.
 *
 * Rules (from UX interaction-rules §1.1):
 * 1. Terminal or read-only → Hidden
 * 2. Active exception (except GPS_LOST) → Disabled with reason
 * 3. Accept phase (DISPATCHED) → Enabled "Accept Trip"
 * 4. Form-required status (LOADING, UNLOADING, DELIVERED) → Enabled with status-specific label
 * 5. Normal milestone → Enabled with action's CTA label
 * 6. Else → Hidden
 *
 * Source: spec FR-020–FR-029, UX interaction-rules §1.1
 */
fun deriveCtaState(trip: TripDetail): CtaState {
    val status = trip.status

    // Rule 1: Terminal or read-only
    if (TripStateMachine.isReadOnly(status) || TripStateMachine.isTerminal(status)) {
        return CtaState.Hidden
    }

    // Rule 2: Exception overlay blocks actions
    if (TripStateMachine.isBlockedByException(status)) {
        return CtaState.Disabled(
            label = "Action Blocked",
            reason = "${status.driverLabel ?: "Issue"} — waiting for operations to resolve",
        )
    }

    // Rule 3: Accept phase — two-button UI, primary CTA is Accept
    if (TripStateMachine.isAcceptPhase(status)) {
        return CtaState.Enabled(label = "Accept Trip")
    }

    // Rule 4+5: Check for forward action
    val action = TripStateMachine.allowedAction(status)
    if (action != null) {
        return CtaState.Enabled(label = action.ctaLabel)
    }

    // Rule 4: Form-required states
    if (TripStateMachine.requiresForm(status)) {
        return CtaState.Enabled(label = ctaLabelForFormState(status))
    }

    // Rule 6: No action available
    return CtaState.Hidden
}

/**
 * Returns the CTA label for form-required states.
 */
private fun ctaLabelForFormState(status: TripStatus): String = when (status) {
    TripStatus.LOADING -> "Complete Loading"
    TripStatus.UNLOADING -> "Complete Delivery"
    TripStatus.DELIVERED -> "Submit POD"
    else -> "Continue"
}

/**
 * Check whether the accept timer has expired.
 *
 * @param dispatchedAt ISO-8601 timestamp when the trip was dispatched.
 * @param timeoutMinutes Accept timeout in minutes (default 30).
 * @param nowEpochMs Current time in epoch milliseconds.
 * @return true if the accept window has expired.
 */
fun isAcceptExpired(
    dispatchedAt: String?,
    timeoutMinutes: Int = 30,
    nowEpochMs: Long,
): Boolean {
    if (dispatchedAt == null) return false
    // Simple ISO-8601 parsing: extract first 19 chars, compute basic epoch
    // In production, use kotlinx-datetime for proper parsing
    return try {
        val instant = kotlinx.datetime.Instant.parse(dispatchedAt)
        val elapsedMs = nowEpochMs - instant.toEpochMilliseconds()
        elapsedMs > timeoutMinutes * 60 * 1000L
    } catch (_: Exception) {
        false // Can't parse timestamp — don't expire
    }
}
