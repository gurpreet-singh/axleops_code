package com.axleops.mobile.trip.state

/**
 * State of the primary CTA (Call to Action) button on the trip detail screen.
 *
 * Derived from the current [TripStatus] via [CtaStateDerivation] (T039).
 * Source: UX interaction-rules.md section 1.1
 */
sealed interface CtaState {
    /** No CTA should be shown (read-only, terminal, hidden states). */
    data object Hidden : CtaState

    /** CTA is visible and actionable. */
    data class Enabled(
        /** Button label, e.g., "Accept Trip", "Depart", "Submit POD". */
        val label: String,
    ) : CtaState

    /** CTA is visible but disabled with a reason (e.g., EWB blocked). */
    data class Disabled(
        /** Button label (grayed out). */
        val label: String,
        /** Explanation of why the action is blocked. */
        val reason: String,
    ) : CtaState

    /** CTA action is in progress (loading spinner replaces button text). */
    data class InProgress(
        /** Original button label for context. */
        val label: String,
    ) : CtaState
}
