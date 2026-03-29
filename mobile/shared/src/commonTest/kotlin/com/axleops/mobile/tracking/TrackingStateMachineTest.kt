package com.axleops.mobile.tracking

import com.axleops.mobile.tracking.model.TrackingState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * Unit tests for [TrackingStateMachine].
 *
 * Tests all valid transitions, invalid transitions (no-ops), and
 * StateFlow emission correctness.
 *
 * Source: spec §5.1, UX tracking-state-inventory transitions
 */
class TrackingStateMachineTest {

    @Test
    fun initialStateIsInactive() {
        val sm = TrackingStateMachine()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }

    // ── Happy Path: Departure → Permission → Active → Arrival ──────────

    @Test
    fun departureTransitionsToAwaitingPermission() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        assertEquals(TrackingState.AWAITING_PERMISSION, sm.currentState)
    }

    @Test
    fun permissionGrantedTransitionsToActive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        assertEquals(TrackingState.ACTIVE, sm.currentState)
    }

    @Test
    fun permissionGrantedForegroundOnlyTransitionsToActiveDegraded() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = false)
        assertEquals(TrackingState.ACTIVE_DEGRADED, sm.currentState)
    }

    @Test
    fun arrivalTransitionsToStopped() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onTripArrived()
        assertEquals(TrackingState.STOPPED, sm.currentState)
    }

    // ── Signal Lost / Restored ─────────────────────────────────────────

    @Test
    fun signalLostFromActive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onGpsSignalLost()
        assertEquals(TrackingState.SIGNAL_LOST, sm.currentState)
    }

    @Test
    fun signalRestoredBackToActive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onGpsSignalLost()
        sm.onGpsSignalRestored()
        assertEquals(TrackingState.ACTIVE, sm.currentState)
    }

    // ── Permission Denied / Revoked ────────────────────────────────────

    @Test
    fun permissionDeniedFromAwaiting() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionDenied()
        assertEquals(TrackingState.PERMISSION_DENIED, sm.currentState)
    }

    @Test
    fun permissionRevokedFromActive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onPermissionRevoked()
        assertEquals(TrackingState.PERMISSION_DENIED, sm.currentState)
    }

    // ── Background Restricted / Restored ───────────────────────────────

    @Test
    fun backgroundRestrictedFromActive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onBackgroundRestricted()
        assertEquals(TrackingState.ACTIVE_DEGRADED, sm.currentState)
    }

    @Test
    fun backgroundRestoredFromDegraded() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onBackgroundRestricted()
        sm.onBackgroundRestored()
        assertEquals(TrackingState.ACTIVE, sm.currentState)
    }

    // ── Reset ──────────────────────────────────────────────────────────

    @Test
    fun resetReturnsToInactive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onTripReset()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }

    // ── Invalid Transitions (no-ops) ───────────────────────────────────

    @Test
    fun signalLostFromInactiveIsNoop() {
        val sm = TrackingStateMachine()
        sm.onGpsSignalLost()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }

    @Test
    fun arrivalFromInactiveIsNoop() {
        val sm = TrackingStateMachine()
        sm.onTripArrived()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }

    @Test
    fun doubleDepartureIsNoop() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onTripDeparted() // Should not change state
        assertEquals(TrackingState.AWAITING_PERMISSION, sm.currentState)
    }

    // ── isActive property ──────────────────────────────────────────────

    @Test
    fun isActiveReturnsTrueForActiveStates() {
        assertTrue(TrackingState.ACTIVE.isActive)
        assertTrue(TrackingState.ACTIVE_DEGRADED.isActive)
        assertTrue(TrackingState.SIGNAL_LOST.isActive)
    }

    @Test
    fun isActiveReturnsFalseForInactiveStates() {
        assertFalse(TrackingState.INACTIVE.isActive)
        assertFalse(TrackingState.STOPPED.isActive)
        assertFalse(TrackingState.PERMISSION_DENIED.isActive)
        assertFalse(TrackingState.AWAITING_PERMISSION.isActive)
    }
}
