package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.CargoCondition
import com.axleops.mobile.domain.model.DriverAction
import com.axleops.mobile.domain.model.TripPhase
import com.axleops.mobile.domain.model.TripStatus
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * Tests for [TripStateMachine].
 *
 * Validates all valid transitions, rejected transitions, exception overlay
 * logic, read-only states, terminal states, and helper query functions.
 */
class TripStateMachineTest {

    // ── Happy Path Transitions ───────────────────────────────────────────

    @Test
    fun `DISPATCHED + Accept = ACCEPTED`() {
        val next = TripStateMachine.nextState(TripStatus.DISPATCHED, DriverAction.Accept)
        assertEquals(TripStatus.ACCEPTED, next)
    }

    @Test
    fun `DISPATCHED + Reject = DRIVER_REJECTED`() {
        val next = TripStateMachine.nextState(TripStatus.DISPATCHED, DriverAction.Reject("No reason"))
        assertEquals(TripStatus.DRIVER_REJECTED, next)
    }

    @Test
    fun `ACCEPTED + ArrivedAtOrigin = AT_ORIGIN`() {
        val next = TripStateMachine.nextState(TripStatus.ACCEPTED, DriverAction.ArrivedAtOrigin)
        assertEquals(TripStatus.AT_ORIGIN, next)
    }

    @Test
    fun `AT_ORIGIN + StartLoading = LOADING`() {
        val next = TripStateMachine.nextState(TripStatus.AT_ORIGIN, DriverAction.StartLoading)
        assertEquals(TripStatus.LOADING, next)
    }

    @Test
    fun `LOADING + LoadingComplete = LOADED`() {
        val action = DriverAction.LoadingComplete(
            actualWeightMt = 22.5,
            sealNumber = "SL-1234",
        )
        val next = TripStateMachine.nextState(TripStatus.LOADING, action)
        assertEquals(TripStatus.LOADED, next)
    }

    @Test
    fun `LOADED + Depart = DEPARTED`() {
        val next = TripStateMachine.nextState(TripStatus.LOADED, DriverAction.Depart)
        assertEquals(TripStatus.DEPARTED, next)
    }

    @Test
    fun `DEPARTED + ArrivedAtDestination = AT_DESTINATION`() {
        val next = TripStateMachine.nextState(TripStatus.DEPARTED, DriverAction.ArrivedAtDestination)
        assertEquals(TripStatus.AT_DESTINATION, next)
    }

    @Test
    fun `IN_TRANSIT + ArrivedAtDestination = AT_DESTINATION`() {
        val next = TripStateMachine.nextState(TripStatus.IN_TRANSIT, DriverAction.ArrivedAtDestination)
        assertEquals(TripStatus.AT_DESTINATION, next)
    }

    @Test
    fun `AT_DESTINATION + StartUnloading = UNLOADING`() {
        val next = TripStateMachine.nextState(TripStatus.AT_DESTINATION, DriverAction.StartUnloading)
        assertEquals(TripStatus.UNLOADING, next)
    }

    @Test
    fun `UNLOADING + DeliveryComplete = DELIVERED`() {
        val action = DriverAction.DeliveryComplete(
            deliveredWeightMt = 22.3,
            condition = CargoCondition.GOOD,
        )
        val next = TripStateMachine.nextState(TripStatus.UNLOADING, action)
        assertEquals(TripStatus.DELIVERED, next)
    }

    @Test
    fun `DELIVERED + SubmitPod = POD_SUBMITTED`() {
        val next = TripStateMachine.nextState(TripStatus.DELIVERED, DriverAction.SubmitPod)
        assertEquals(TripStatus.POD_SUBMITTED, next)
    }

    // ── Invalid Transitions ─────────────────────────────────────────────

    @Test
    fun `cannot accept an already accepted trip`() {
        val next = TripStateMachine.nextState(TripStatus.ACCEPTED, DriverAction.Accept)
        assertNull(next)
    }

    @Test
    fun `cannot depart from AT_ORIGIN (must load first)`() {
        val next = TripStateMachine.nextState(TripStatus.AT_ORIGIN, DriverAction.Depart)
        assertNull(next)
    }

    @Test
    fun `cannot skip loading`() {
        val next = TripStateMachine.nextState(TripStatus.ACCEPTED, DriverAction.Depart)
        assertNull(next)
    }

    @Test
    fun `cannot submit POD from LOADING`() {
        val next = TripStateMachine.nextState(TripStatus.LOADING, DriverAction.SubmitPod)
        assertNull(next)
    }

    @Test
    fun `cannot accept from IN_TRANSIT`() {
        val next = TripStateMachine.nextState(TripStatus.IN_TRANSIT, DriverAction.Accept)
        assertNull(next)
    }

    // ── isAllowed ────────────────────────────────────────────────────────

    @Test
    fun `isAllowed returns true for valid transition`() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.DISPATCHED, DriverAction.Accept))
    }

    @Test
    fun `isAllowed returns false for invalid transition`() {
        assertFalse(TripStateMachine.isAllowed(TripStatus.DELIVERED, DriverAction.Depart))
    }

    // ── allowedAction ────────────────────────────────────────────────────

    @Test
    fun `allowedAction for ACCEPTED is ArrivedAtOrigin`() {
        val action = TripStateMachine.allowedAction(TripStatus.ACCEPTED)
        assertTrue(action is DriverAction.ArrivedAtOrigin)
    }

    @Test
    fun `allowedAction for DISPATCHED is null (multi-action)`() {
        val action = TripStateMachine.allowedAction(TripStatus.DISPATCHED)
        assertNull(action)
    }

    @Test
    fun `allowedAction for LOADING is null (requires form)`() {
        val action = TripStateMachine.allowedAction(TripStatus.LOADING)
        assertNull(action)
    }

    @Test
    fun `allowedAction for POD_SUBMITTED is null (read-only)`() {
        val action = TripStateMachine.allowedAction(TripStatus.POD_SUBMITTED)
        assertNull(action)
    }

    @Test
    fun `allowedAction for DELIVERED is SubmitPod`() {
        val action = TripStateMachine.allowedAction(TripStatus.DELIVERED)
        assertTrue(action is DriverAction.SubmitPod)
    }

    // ── Read-Only States ─────────────────────────────────────────────────

    @Test
    fun `POD_SUBMITTED is read-only`() {
        assertTrue(TripStateMachine.isReadOnly(TripStatus.POD_SUBMITTED))
    }

    @Test
    fun `POD_VERIFIED is read-only`() {
        assertTrue(TripStateMachine.isReadOnly(TripStatus.POD_VERIFIED))
    }

    @Test
    fun `POD_DISPUTED is read-only`() {
        assertTrue(TripStateMachine.isReadOnly(TripStatus.POD_DISPUTED))
    }

    @Test
    fun `COMPLETED is read-only`() {
        assertTrue(TripStateMachine.isReadOnly(TripStatus.COMPLETED))
    }

    @Test
    fun `SETTLED is read-only`() {
        assertTrue(TripStateMachine.isReadOnly(TripStatus.SETTLED))
    }

    @Test
    fun `CANCELLED is read-only`() {
        assertTrue(TripStateMachine.isReadOnly(TripStatus.CANCELLED))
    }

    @Test
    fun `IN_TRANSIT is not read-only`() {
        assertFalse(TripStateMachine.isReadOnly(TripStatus.IN_TRANSIT))
    }

    // ── Exception States ─────────────────────────────────────────────────

    @Test
    fun `VEHICLE_BREAKDOWN is a blocking exception`() {
        assertTrue(TripStateMachine.isException(TripStatus.VEHICLE_BREAKDOWN))
        assertTrue(TripStateMachine.isBlockedByException(TripStatus.VEHICLE_BREAKDOWN))
    }

    @Test
    fun `ACCIDENT is a blocking exception`() {
        assertTrue(TripStateMachine.isException(TripStatus.ACCIDENT))
        assertTrue(TripStateMachine.isBlockedByException(TripStatus.ACCIDENT))
    }

    @Test
    fun `GPS_LOST is an exception but NOT blocking`() {
        assertTrue(TripStateMachine.isException(TripStatus.GPS_LOST))
        assertFalse(TripStateMachine.isBlockedByException(TripStatus.GPS_LOST))
    }

    @Test
    fun `EWB_EXPIRED is a blocking exception`() {
        assertTrue(TripStateMachine.isException(TripStatus.EWB_EXPIRED))
        assertTrue(TripStateMachine.isBlockedByException(TripStatus.EWB_EXPIRED))
    }

    @Test
    fun `CARGO_SHORTAGE is an exception but not fully blocking`() {
        assertTrue(TripStateMachine.isException(TripStatus.CARGO_SHORTAGE))
        assertFalse(TripStateMachine.isBlockedByException(TripStatus.CARGO_SHORTAGE))
    }

    @Test
    fun `normal status is not exception`() {
        assertFalse(TripStateMachine.isException(TripStatus.IN_TRANSIT))
        assertFalse(TripStateMachine.isBlockedByException(TripStatus.IN_TRANSIT))
    }

    // ── Terminal States ──────────────────────────────────────────────────

    @Test
    fun `SETTLED is terminal`() {
        assertTrue(TripStateMachine.isTerminal(TripStatus.SETTLED))
    }

    @Test
    fun `CANCELLED is terminal`() {
        assertTrue(TripStateMachine.isTerminal(TripStatus.CANCELLED))
    }

    @Test
    fun `TRANSFERRED is terminal`() {
        assertTrue(TripStateMachine.isTerminal(TripStatus.TRANSFERRED))
    }

    @Test
    fun `DRIVER_REJECTED is terminal`() {
        assertTrue(TripStateMachine.isTerminal(TripStatus.DRIVER_REJECTED))
    }

    @Test
    fun `IN_TRANSIT is not terminal`() {
        assertFalse(TripStateMachine.isTerminal(TripStatus.IN_TRANSIT))
    }

    // ── GPS Tracking ─────────────────────────────────────────────────────

    @Test
    fun `shouldTrackGps is true for DEPARTED`() {
        assertTrue(TripStateMachine.shouldTrackGps(TripStatus.DEPARTED))
    }

    @Test
    fun `shouldTrackGps is true for IN_TRANSIT`() {
        assertTrue(TripStateMachine.shouldTrackGps(TripStatus.IN_TRANSIT))
    }

    @Test
    fun `shouldTrackGps is false for AT_DESTINATION`() {
        assertFalse(TripStateMachine.shouldTrackGps(TripStatus.AT_DESTINATION))
    }

    @Test
    fun `shouldTrackGps is false for LOADING`() {
        assertFalse(TripStateMachine.shouldTrackGps(TripStatus.LOADING))
    }

    // ── Record Modification ──────────────────────────────────────────────

    @Test
    fun `canModifyRecords is true during active trip`() {
        assertTrue(TripStateMachine.canModifyRecords(TripStatus.IN_TRANSIT))
        assertTrue(TripStateMachine.canModifyRecords(TripStatus.DELIVERED))
    }

    @Test
    fun `canModifyRecords is false after POD submitted`() {
        assertFalse(TripStateMachine.canModifyRecords(TripStatus.POD_SUBMITTED))
    }

    @Test
    fun `canModifyRecords is false for terminal state`() {
        assertFalse(TripStateMachine.canModifyRecords(TripStatus.CANCELLED))
    }

    // ── Accept Phase ─────────────────────────────────────────────────────

    @Test
    fun `isAcceptPhase is true for DISPATCHED`() {
        assertTrue(TripStateMachine.isAcceptPhase(TripStatus.DISPATCHED))
    }

    @Test
    fun `isAcceptPhase is false for non-dispatched`() {
        assertFalse(TripStateMachine.isAcceptPhase(TripStatus.ACCEPTED))
        assertFalse(TripStateMachine.isAcceptPhase(TripStatus.IN_TRANSIT))
    }

    // ── Requires Form ────────────────────────────────────────────────────

    @Test
    fun `requiresForm is true for LOADING status`() {
        assertTrue(TripStateMachine.requiresForm(TripStatus.LOADING))
    }

    @Test
    fun `requiresForm is true for UNLOADING status`() {
        assertTrue(TripStateMachine.requiresForm(TripStatus.UNLOADING))
    }

    @Test
    fun `requiresForm is true for DELIVERED status`() {
        assertTrue(TripStateMachine.requiresForm(TripStatus.DELIVERED))
    }

    @Test
    fun `requiresForm is false for simple transitions`() {
        assertFalse(TripStateMachine.requiresForm(TripStatus.ACCEPTED))
        assertFalse(TripStateMachine.requiresForm(TripStatus.LOADED))
    }

    // ── Happy Path List ──────────────────────────────────────────────────

    @Test
    fun `happyPathStatuses starts with DISPATCHED and ends with SETTLED`() {
        assertEquals(TripStatus.DISPATCHED, TripStateMachine.happyPathStatuses.first())
        assertEquals(TripStatus.SETTLED, TripStateMachine.happyPathStatuses.last())
    }

    @Test
    fun `happyPathStatuses has 13 entries`() {
        assertEquals(13, TripStateMachine.happyPathStatuses.size)
    }

    // ── TripStatus Properties ────────────────────────────────────────────

    @Test
    fun `TripStatus phase mapping for key states`() {
        assertEquals(TripPhase.CREATED, TripStatus.DISPATCHED.phase)
        assertEquals(TripPhase.IN_TRANSIT, TripStatus.LOADING.phase)
        assertEquals(TripPhase.IN_TRANSIT, TripStatus.IN_TRANSIT.phase)
        assertEquals(TripPhase.COMPLETED, TripStatus.POD_SUBMITTED.phase)
        assertEquals(TripPhase.SETTLED, TripStatus.SETTLED.phase)
    }

    @Test
    fun `DRAFT and CREATED are not driver visible`() {
        assertFalse(TripStatus.DRAFT.isDriverVisible)
        assertFalse(TripStatus.CREATED.isDriverVisible)
    }

    @Test
    fun `DISPATCHED through DELIVERED are driver visible`() {
        assertTrue(TripStatus.DISPATCHED.isDriverVisible)
        assertTrue(TripStatus.IN_TRANSIT.isDriverVisible)
        assertTrue(TripStatus.DELIVERED.isDriverVisible)
    }

    @Test
    fun `driver labels match state inventory`() {
        assertEquals("Trip Dispatched", TripStatus.DISPATCHED.driverLabel)
        assertEquals("At Loading Point", TripStatus.AT_ORIGIN.driverLabel)
        assertEquals("In Transit", TripStatus.IN_TRANSIT.driverLabel)
        assertEquals("Delivered", TripStatus.DELIVERED.driverLabel)
        assertEquals("POD Submitted", TripStatus.POD_SUBMITTED.driverLabel)
        assertNull(TripStatus.DRAFT.driverLabel)
    }

    @Test
    fun `fromString returns UNKNOWN for unrecognized value`() {
        assertEquals(TripStatus.UNKNOWN, TripStatus.fromString("NONEXISTENT"))
    }

    @Test
    fun `fromString returns correct value for known string`() {
        assertEquals(TripStatus.IN_TRANSIT, TripStatus.fromString("IN_TRANSIT"))
    }

    // ── Full Lifecycle Walk ──────────────────────────────────────────────

    @Test
    fun `complete happy path walk through all milestones`() {
        var status = TripStatus.DISPATCHED

        // Accept
        status = TripStateMachine.nextState(status, DriverAction.Accept)!!
        assertEquals(TripStatus.ACCEPTED, status)

        // Arrive at origin
        status = TripStateMachine.nextState(status, DriverAction.ArrivedAtOrigin)!!
        assertEquals(TripStatus.AT_ORIGIN, status)

        // Start loading
        status = TripStateMachine.nextState(status, DriverAction.StartLoading)!!
        assertEquals(TripStatus.LOADING, status)

        // Loading complete
        status = TripStateMachine.nextState(status, DriverAction.LoadingComplete(22.5, "SL-1234"))!!
        assertEquals(TripStatus.LOADED, status)

        // Depart
        status = TripStateMachine.nextState(status, DriverAction.Depart)!!
        assertEquals(TripStatus.DEPARTED, status)

        // Arrive at destination
        status = TripStateMachine.nextState(status, DriverAction.ArrivedAtDestination)!!
        assertEquals(TripStatus.AT_DESTINATION, status)

        // Start unloading
        status = TripStateMachine.nextState(status, DriverAction.StartUnloading)!!
        assertEquals(TripStatus.UNLOADING, status)

        // Delivery complete
        status = TripStateMachine.nextState(status, DriverAction.DeliveryComplete(22.3, CargoCondition.GOOD))!!
        assertEquals(TripStatus.DELIVERED, status)

        // Submit POD
        status = TripStateMachine.nextState(status, DriverAction.SubmitPod)!!
        assertEquals(TripStatus.POD_SUBMITTED, status)

        // Verify final state is read-only
        assertTrue(status.isReadOnly)
    }
}
