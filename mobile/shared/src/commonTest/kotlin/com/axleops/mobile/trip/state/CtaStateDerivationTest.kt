package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue
import kotlin.test.assertFalse

/**
 * Tests for [deriveCtaState] and [isAcceptExpired].
 *
 * Covers all 6 CTA derivation rules and the accept timeout logic.
 */
class CtaStateDerivationTest {

    private fun tripWith(status: TripStatus) = TripDetail(
        id = 1L,
        tripNumber = "TRP-001",
        status = status,
        originCity = "Mumbai",
        destinationCity = "Pune",
    )

    // ── Rule 1: Terminal / Read-only → Hidden ────────────────────────────

    @Test
    fun `POD_SUBMITTED is read-only so CTA is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.POD_SUBMITTED))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `POD_VERIFIED is read-only so CTA is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.POD_VERIFIED))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `SETTLED is terminal so CTA is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.SETTLED))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `CANCELLED is terminal so CTA is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.CANCELLED))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `TRANSFERRED is terminal so CTA is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.TRANSFERRED))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `COMPLETED is read-only so CTA is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.COMPLETED))
        assertIs<CtaState.Hidden>(result)
    }

    // ── Rule 2: Exception → Disabled ─────────────────────────────────────

    @Test
    fun `VEHICLE_BREAKDOWN blocks CTA with reason`() {
        val result = deriveCtaState(tripWith(TripStatus.VEHICLE_BREAKDOWN))
        assertIs<CtaState.Disabled>(result)
        assertTrue(result.reason.contains("resolve"), "Should mention resolution")
    }

    @Test
    fun `ACCIDENT blocks CTA with reason`() {
        val result = deriveCtaState(tripWith(TripStatus.ACCIDENT))
        assertIs<CtaState.Disabled>(result)
    }

    @Test
    fun `CARGO_DAMAGE blocks CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.CARGO_DAMAGE))
        assertIs<CtaState.Disabled>(result)
    }

    @Test
    fun `DELIVERY_REJECTED blocks CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.DELIVERY_REJECTED))
        assertIs<CtaState.Disabled>(result)
    }

    @Test
    fun `EWB_EXPIRED blocks CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.EWB_EXPIRED))
        assertIs<CtaState.Disabled>(result)
    }

    // ── Rule 3: Accept phase → Enabled "Accept Trip" ─────────────────────

    @Test
    fun `DISPATCHED shows Accept Trip CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.DISPATCHED))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Accept Trip", result.label)
    }

    // ── Rule 4+5: Normal milestone → Enabled with action label ───────────

    @Test
    fun `ACCEPTED shows Arrived at Origin CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.ACCEPTED))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Arrived at Origin", result.label)
    }

    @Test
    fun `AT_ORIGIN shows Start Loading CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.AT_ORIGIN))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Start Loading", result.label)
    }

    @Test
    fun `LOADED shows Depart CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.LOADED))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Depart", result.label)
    }

    @Test
    fun `DEPARTED shows Arrived at Destination CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.DEPARTED))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Arrived at Destination", result.label)
    }

    @Test
    fun `AT_DESTINATION shows Start Unloading CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.AT_DESTINATION))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Start Unloading", result.label)
    }

    // ── Rule 4: Form-required → Enabled with status-specific label ───────

    @Test
    fun `LOADING shows Complete Loading CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.LOADING))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Complete Loading", result.label)
    }

    @Test
    fun `UNLOADING shows Complete Delivery CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.UNLOADING))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Complete Delivery", result.label)
    }

    @Test
    fun `DELIVERED shows Submit POD CTA`() {
        val result = deriveCtaState(tripWith(TripStatus.DELIVERED))
        assertIs<CtaState.Enabled>(result)
        assertEquals("Submit POD", result.label)
    }

    // ── Accept Timeout ───────────────────────────────────────────────────

    @Test
    fun `isAcceptExpired returns false when dispatchedAt is null`() {
        val now = kotlinx.datetime.Clock.System.now()
        assertFalse(isAcceptExpired(null, 30, now.toEpochMilliseconds()))
    }

    @Test
    fun `isAcceptExpired returns false for recent dispatch`() {
        val now = kotlinx.datetime.Clock.System.now()
        val fiveMinutesAgo = now.minus(kotlin.time.Duration.parseIsoString("PT5M"))
        assertFalse(isAcceptExpired(fiveMinutesAgo.toString(), 30, now.toEpochMilliseconds()))
    }

    @Test
    fun `isAcceptExpired returns true for expired dispatch`() {
        val now = kotlinx.datetime.Clock.System.now()
        val fortyMinutesAgo = now.minus(kotlin.time.Duration.parseIsoString("PT40M"))
        assertTrue(isAcceptExpired(fortyMinutesAgo.toString(), 30, now.toEpochMilliseconds()))
    }

    // ── Non-driver-visible states → Hidden ──────────────────────────────

    @Test
    fun `DRAFT is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.DRAFT))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `CREATED is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.CREATED))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `UNKNOWN is hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.UNKNOWN))
        assertIs<CtaState.Hidden>(result)
    }

    @Test
    fun `DRIVER_REJECTED is terminal so hidden`() {
        val result = deriveCtaState(tripWith(TripStatus.DRIVER_REJECTED))
        assertIs<CtaState.Hidden>(result)
    }

    // ── Warning exception (GPS_LOST) ──────────────────────────────────

    @Test
    fun `GPS_LOST is not a blocking exception so CTA depends on status`() {
        // GPS_LOST is a warning-only exception
        val result = deriveCtaState(tripWith(TripStatus.GPS_LOST))
        // GPS_LOST is an exception but not blocking - should show hidden since no forward action
        assertIs<CtaState.Hidden>(result)
    }
}

