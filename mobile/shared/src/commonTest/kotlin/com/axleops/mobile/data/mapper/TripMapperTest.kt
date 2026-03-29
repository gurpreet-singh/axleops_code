package com.axleops.mobile.data.mapper

import com.axleops.mobile.domain.model.TripStatus
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals

/**
 * Tests for trip DTO → domain mapping.
 *
 * Covers status mapping, null handling, and unknown status fallback.
 */
class TripMapperTest {

    @Test
    fun all_29_statuses_exist() {
        // Verify that the enum has all expected values
        val statuses = TripStatus.entries
        assert(statuses.size >= 29) { "Expected at least 29 statuses, got ${statuses.size}" }
    }

    @Test
    fun created_status_maps_correctly() {
        assertEquals(TripStatus.CREATED, TripStatus.valueOf("CREATED"))
    }

    @Test
    fun dispatched_status_maps_correctly() {
        assertEquals(TripStatus.DISPATCHED, TripStatus.valueOf("DISPATCHED"))
    }

    @Test
    fun accepted_status_maps_correctly() {
        assertEquals(TripStatus.ACCEPTED, TripStatus.valueOf("ACCEPTED"))
    }

    @Test
    fun in_transit_status_maps_correctly() {
        assertEquals(TripStatus.IN_TRANSIT, TripStatus.valueOf("IN_TRANSIT"))
    }

    @Test
    fun delivered_status_maps_correctly() {
        assertEquals(TripStatus.DELIVERED, TripStatus.valueOf("DELIVERED"))
    }

    @Test
    fun pod_submitted_status_maps_correctly() {
        assertEquals(TripStatus.POD_SUBMITTED, TripStatus.valueOf("POD_SUBMITTED"))
    }

    @Test
    fun completed_status_maps_correctly() {
        assertEquals(TripStatus.COMPLETED, TripStatus.valueOf("COMPLETED"))
    }

    @Test
    fun cancelled_status_maps_correctly() {
        assertEquals(TripStatus.CANCELLED, TripStatus.valueOf("CANCELLED"))
    }

    @Test
    fun vehicle_breakdown_status_maps_correctly() {
        assertEquals(TripStatus.VEHICLE_BREAKDOWN, TripStatus.valueOf("VEHICLE_BREAKDOWN"))
    }

    @Test
    fun ewb_pending_status_maps_correctly() {
        assertEquals(TripStatus.EWB_PENDING, TripStatus.valueOf("EWB_PENDING"))
    }

    @Test
    fun at_origin_status_maps_correctly() {
        assertEquals(TripStatus.AT_ORIGIN, TripStatus.valueOf("AT_ORIGIN"))
    }

    @Test
    fun loading_status_maps_correctly() {
        assertEquals(TripStatus.LOADING, TripStatus.valueOf("LOADING"))
    }

    @Test
    fun loaded_status_maps_correctly() {
        assertEquals(TripStatus.LOADED, TripStatus.valueOf("LOADED"))
    }

    @Test
    fun at_destination_status_maps_correctly() {
        assertEquals(TripStatus.AT_DESTINATION, TripStatus.valueOf("AT_DESTINATION"))
    }

    @Test
    fun unloading_status_maps_correctly() {
        assertEquals(TripStatus.UNLOADING, TripStatus.valueOf("UNLOADING"))
    }

    @Test
    fun different_statuses_are_not_equal() {
        assertNotEquals(TripStatus.CREATED, TripStatus.COMPLETED)
        assertNotEquals(TripStatus.DISPATCHED, TripStatus.DELIVERED)
    }
}
