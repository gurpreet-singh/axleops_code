package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.CargoCondition
import com.axleops.mobile.domain.model.DriverAction
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.trip.state.TripStateMachine
import kotlin.test.Test
import kotlin.test.assertTrue
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull

/**
 * Tests for milestone transition rules via [TripStateMachine].
 */
class TransitionMilestoneUseCaseTest {

    @Test
    fun dispatched_allows_accept() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.DISPATCHED, DriverAction.Accept))
    }

    @Test
    fun dispatched_allows_reject() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.DISPATCHED, DriverAction.Reject("test")))
    }

    @Test
    fun accepted_allows_arrived_at_origin() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.ACCEPTED, DriverAction.ArrivedAtOrigin))
    }

    @Test
    fun at_origin_allows_start_loading() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.AT_ORIGIN, DriverAction.StartLoading))
    }

    @Test
    fun loading_allows_loading_complete() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.LOADING, DriverAction.LoadingComplete(20.0)))
    }

    @Test
    fun loaded_allows_depart() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.LOADED, DriverAction.Depart))
    }

    @Test
    fun departed_allows_arrived_at_destination() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.DEPARTED, DriverAction.ArrivedAtDestination))
    }

    @Test
    fun in_transit_allows_arrived_at_destination() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.IN_TRANSIT, DriverAction.ArrivedAtDestination))
    }

    @Test
    fun at_destination_allows_start_unloading() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.AT_DESTINATION, DriverAction.StartUnloading))
    }

    @Test
    fun unloading_allows_delivery_complete() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.UNLOADING, DriverAction.DeliveryComplete(19.5, CargoCondition.GOOD)))
    }

    @Test
    fun delivered_allows_submit_pod() {
        assertTrue(TripStateMachine.isAllowed(TripStatus.DELIVERED, DriverAction.SubmitPod))
    }

    @Test
    fun completed_does_not_allow_submit_pod() {
        assertFalse(TripStateMachine.isAllowed(TripStatus.COMPLETED, DriverAction.SubmitPod))
    }

    @Test
    fun cancelled_does_not_allow_accept() {
        assertFalse(TripStateMachine.isAllowed(TripStatus.CANCELLED, DriverAction.Accept))
    }

    @Test
    fun vehicle_breakdown_is_blocking_exception() {
        assertTrue(TripStateMachine.isBlockedByException(TripStatus.VEHICLE_BREAKDOWN))
    }

    @Test
    fun accepted_is_not_blocking_exception() {
        assertFalse(TripStateMachine.isBlockedByException(TripStatus.ACCEPTED))
    }

    @Test
    fun allowed_action_for_accepted_is_arrived_at_origin() {
        val action = TripStateMachine.allowedAction(TripStatus.ACCEPTED)
        assertNotNull(action)
        assertTrue(action is DriverAction.ArrivedAtOrigin)
    }

    @Test
    fun allowed_action_for_completed_is_null() {
        assertNull(TripStateMachine.allowedAction(TripStatus.COMPLETED))
    }
}
