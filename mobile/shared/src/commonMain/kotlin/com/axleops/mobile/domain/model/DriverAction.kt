package com.axleops.mobile.domain.model

/**
 * All actions a driver can take on a trip.
 *
 * Each variant maps to a specific milestone transition (from spec FR-020–FR-035)
 * and carries the data captured during that action. The [TripStateMachine]
 * validates whether a given action is permitted in the current [TripStatus].
 *
 * This sealed hierarchy is the single source of truth for "what can the driver do."
 * UI derives CTA labels from these. Use cases translate these into [TransitionRequest].
 *
 * Source: plan §2.3, spec FR-020–FR-035, UX interaction-rules.md §1
 */
sealed class DriverAction {

    /** CTA label shown to the driver for this action. */
    abstract val ctaLabel: String

    /** The transition event name sent to the backend. */
    abstract val transitionEvent: String

    // ── Trip Acceptance ──────────────────────────────────────────────────

    /** Accept a dispatched trip. */
    data object Accept : DriverAction() {
        override val ctaLabel = "Accept Trip"
        override val transitionEvent = "ACCEPT"
    }

    /** Reject a dispatched trip with a reason. */
    data class Reject(val reason: String) : DriverAction() {
        override val ctaLabel = "Reject Trip"
        override val transitionEvent = "REJECT"
    }

    // ── Milestone Progression ───────────────────────────────────────────

    /** Mark arrival at origin / loading point. */
    data object ArrivedAtOrigin : DriverAction() {
        override val ctaLabel = "Arrived at Origin"
        override val transitionEvent = "ARRIVE_ORIGIN"
    }

    /** Start loading at origin. */
    data object StartLoading : DriverAction() {
        override val ctaLabel = "Start Loading"
        override val transitionEvent = "START_LOADING"
    }

    /**
     * Mark loading as complete.
     *
     * Captures: actual weight (MT), seal number (if required), optional photos.
     */
    data class LoadingComplete(
        val actualWeightMt: Double,
        val sealNumber: String? = null,
        val photoIds: List<String> = emptyList(),
    ) : DriverAction() {
        override val ctaLabel = "Loading Complete"
        override val transitionEvent = "LOADING_COMPLETE"
    }

    /**
     * Depart from origin.
     *
     * Note: per clarification Q2, the EWB guard is backend-only.
     * Mobile sends this transition; backend rejects with 422 if EWB not ready.
     */
    data object Depart : DriverAction() {
        override val ctaLabel = "Depart"
        override val transitionEvent = "DEPART"
    }

    /** Mark arrival at destination. */
    data object ArrivedAtDestination : DriverAction() {
        override val ctaLabel = "Arrived at Destination"
        override val transitionEvent = "ARRIVE_DESTINATION"
    }

    /** Start unloading at destination. */
    data object StartUnloading : DriverAction() {
        override val ctaLabel = "Start Unloading"
        override val transitionEvent = "START_UNLOADING"
    }

    /**
     * Mark delivery as complete.
     *
     * Captures: delivered weight and cargo condition.
     */
    data class DeliveryComplete(
        val deliveredWeightMt: Double,
        val condition: CargoCondition,
    ) : DriverAction() {
        override val ctaLabel = "Delivery Complete"
        override val transitionEvent = "DELIVERY_COMPLETE"
    }

    // ── POD Submission ──────────────────────────────────────────────────

    /**
     * Submit Proof of Delivery.
     *
     * This is the final milestone action. After POD_SUBMITTED, the trip
     * becomes read-only for the driver.
     */
    data object SubmitPod : DriverAction() {
        override val ctaLabel = "Submit POD"
        override val transitionEvent = "SUBMIT_POD"
    }
}
