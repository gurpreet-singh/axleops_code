package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.TripStatus

/**
 * Pure permission functions: can the driver perform X in state Y?
 *
 * These are the granular permission checks used by UI to show/hide
 * secondary action buttons (expense logging, document upload, etc.)
 * independently of the primary CTA.
 *
 * Source: spec FR-030–FR-034, clarification Q4
 */
object ActionPermissions {

    /**
     * Whether expenses can be added/edited in this trip status.
     *
     * Allowed: ACCEPTED through DELIVERED (active trip, not read-only).
     * Not allowed: before acceptance, after POD, terminal, exceptions.
     */
    fun canAddExpense(status: TripStatus): Boolean =
        TripStateMachine.canModifyRecords(status) && !TripStateMachine.isAcceptPhase(status)

    /**
     * Whether documents can be uploaded in this trip status.
     *
     * Same rules as expenses: active trip, not read-only.
     */
    fun canAddDocument(status: TripStatus): Boolean =
        TripStateMachine.canModifyRecords(status) && !TripStateMachine.isAcceptPhase(status)

    /**
     * Whether the driver can report an exception in this trip status.
     *
     * Allowed: ACCEPTED through DELIVERED.
     * Not allowed: if already in an exception state (no nested exceptions).
     */
    fun canReportException(status: TripStatus): Boolean =
        TripStateMachine.canModifyRecords(status)
            && !TripStateMachine.isAcceptPhase(status)
            && !TripStateMachine.isException(status)

    /**
     * Whether the driver can log a checkpoint event in this trip status.
     *
     * Allowed only during transit phases (DEPARTED, IN_TRANSIT, AT_CHECKPOINT).
     */
    fun canLogCheckpoint(status: TripStatus): Boolean = when (status) {
        TripStatus.DEPARTED,
        TripStatus.IN_TRANSIT,
        TripStatus.AT_CHECKPOINT,
        -> true
        else -> false
    }

    /**
     * Whether the driver can view (but not modify) documents and expenses.
     *
     * Viewable in all driver-visible states (even read-only post-POD).
     */
    fun canViewRecords(status: TripStatus): Boolean =
        status.isDriverVisible

    /**
     * Whether the primary milestone CTA should be shown.
     *
     * Not shown for read-only, terminal, or accept phase.
     */
    fun showPrimaryCta(status: TripStatus): Boolean =
        !TripStateMachine.isReadOnly(status)
            && !TripStateMachine.isTerminal(status)

    /**
     * Whether the trip card should show a progress indicator (pulsing dot).
     *
     * Shown during active lifecycle states where the driver is expected to act.
     */
    fun showProgressIndicator(status: TripStatus): Boolean =
        !TripStateMachine.isReadOnly(status)
            && !TripStateMachine.isTerminal(status)
            && !TripStateMachine.isException(status)
}
