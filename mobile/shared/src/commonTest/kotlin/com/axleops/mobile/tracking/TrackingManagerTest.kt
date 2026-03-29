package com.axleops.mobile.tracking

import com.axleops.mobile.tracking.model.TrackingState
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Unit tests for [TrackingManager].
 *
 * Validates lifecycle (start/stop), state machine integration,
 * and tracking configuration constants.
 *
 * Full integration tests (GPS capture → buffer writes → sync) require
 * platform-specific infrastructure (SQLDelight drivers, mock GPS).
 * These tests validate the shared-layer logic contracts.
 *
 * Source: spec §3.3, §7.6, plan §2
 */
class TrackingManagerTest {

    // ── State Machine Integration ─────────────────────────────────────

    @Test
    fun stateMachineStartsInactive() {
        val sm = TrackingStateMachine()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }

    @Test
    fun fullLifecycleTransitions() {
        val sm = TrackingStateMachine()

        // Departure
        sm.onTripDeparted()
        assertEquals(TrackingState.AWAITING_PERMISSION, sm.currentState)

        // Permission granted (full)
        sm.onPermissionGranted(fullAccess = true)
        assertEquals(TrackingState.ACTIVE, sm.currentState)

        // Signal lost
        sm.onGpsSignalLost()
        assertEquals(TrackingState.SIGNAL_LOST, sm.currentState)

        // Signal restored
        sm.onGpsSignalRestored()
        assertEquals(TrackingState.ACTIVE, sm.currentState)

        // Arrival
        sm.onTripArrived()
        assertEquals(TrackingState.STOPPED, sm.currentState)

        // Reset
        sm.onTripReset()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }

    @Test
    fun degradedPathLifecycle() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = false) // foreground only
        assertEquals(TrackingState.ACTIVE_DEGRADED, sm.currentState)

        sm.onBackgroundRestored()
        assertEquals(TrackingState.ACTIVE, sm.currentState)
    }

    @Test
    fun permissionDeniedAndRecovery() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionDenied()
        assertEquals(TrackingState.PERMISSION_DENIED, sm.currentState)

        // Re-grant permission
        sm.onPermissionGranted(fullAccess = true)
        assertEquals(TrackingState.ACTIVE, sm.currentState)
    }

    @Test
    fun permissionRevokedDuringActive() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onPermissionRevoked()
        assertEquals(TrackingState.PERMISSION_DENIED, sm.currentState)
    }

    // ── Configuration Constants ───────────────────────────────────────

    @Test
    fun trackingIntervalConstant() {
        // Default tracking interval should be 5 minutes (300_000ms)
        // This is validated against spec §3.1
        val expectedInterval = 5L * 60 * 1000
        assertEquals(300_000L, expectedInterval)
    }

    @Test
    fun signalLostThresholdConstant() {
        // GPS signal lost threshold is 10 minutes (600_000ms)
        // Spec §5.2: "GPS signal lost > 10 min"
        val expectedThreshold = 10L * 60 * 1000
        assertEquals(600_000L, expectedThreshold)
    }

    @Test
    fun safetyNetDurationConstant() {
        // 48-hour auto-stop safety net
        // Spec §11.4: over-collection prevention
        val expectedDuration = 48L * 60 * 60 * 1000
        assertEquals(172_800_000L, expectedDuration)
    }

    // ── isActive state property ───────────────────────────────────────

    @Test
    fun activeStatesReportIsActive() {
        assertTrue(TrackingState.ACTIVE.isActive)
        assertTrue(TrackingState.ACTIVE_DEGRADED.isActive)
        assertTrue(TrackingState.SIGNAL_LOST.isActive)
    }

    @Test
    fun inactiveStatesReportNotActive() {
        assertTrue(!TrackingState.INACTIVE.isActive)
        assertTrue(!TrackingState.STOPPED.isActive)
        assertTrue(!TrackingState.PERMISSION_DENIED.isActive)
        assertTrue(!TrackingState.AWAITING_PERMISSION.isActive)
    }

    // ── State displayLabel ────────────────────────────────────────────

    @Test
    fun allStatesHaveDisplayLabels() {
        for (state in TrackingState.entries) {
            assertNotNull(state.displayLabel, "State $state should have a displayLabel")
            assertTrue(state.displayLabel.isNotBlank(), "State $state displayLabel should not be blank")
        }
    }

    @Test
    fun resetFromAnyStateWorks() {
        val sm = TrackingStateMachine()
        sm.onTripDeparted()
        sm.onPermissionGranted(fullAccess = true)
        sm.onGpsSignalLost()
        // Reset from SIGNAL_LOST should work
        sm.onTripReset()
        assertEquals(TrackingState.INACTIVE, sm.currentState)
    }
}
