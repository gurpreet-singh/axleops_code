package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.TripDetail

/**
 * UI state for the Active Trip screen.
 *
 * Each variant maps to a distinct visual state on the Active Trip tab.
 * Source: UX state-inventory.md section 4 (Screen-Level UX States)
 */
sealed interface TripUiState {
    /** Initial loading state - show skeleton UI. */
    data object Loading : TripUiState

    /** No trip assigned to this driver - show empty state with illustration. */
    data object NoTrip : TripUiState

    /** Network or parse error - show error with retry. */
    data class Error(val message: String) : TripUiState

    /** Trip is loaded and active - show trip card and details. */
    data class Active(
        /** The full trip detail. */
        val trip: TripDetail,
        /** CTA state derived from the trip status and context. */
        val ctaState: CtaState = CtaState.Hidden,
        /** Whether an accept/reject action is in progress. */
        val isActionInProgress: Boolean = false,
    ) : TripUiState
}
