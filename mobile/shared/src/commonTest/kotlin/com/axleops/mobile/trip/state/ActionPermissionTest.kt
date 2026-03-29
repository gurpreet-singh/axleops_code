package com.axleops.mobile.trip.state

import com.axleops.mobile.domain.model.TripStatus
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * Tests for [ActionPermissions].
 *
 * Validates all 7 permission functions against every relevant trip status
 * to ensure correct show/hide behavior for secondary action buttons.
 */
class ActionPermissionTest {

    // ── canAddExpense ─────────────────────────────────────────────────────

    @Test
    fun `canAddExpense is false for DISPATCHED (accept phase)`() {
        assertFalse(ActionPermissions.canAddExpense(TripStatus.DISPATCHED))
    }

    @Test
    fun `canAddExpense is true for ACCEPTED`() {
        assertTrue(ActionPermissions.canAddExpense(TripStatus.ACCEPTED))
    }

    @Test
    fun `canAddExpense is true for IN_TRANSIT`() {
        assertTrue(ActionPermissions.canAddExpense(TripStatus.IN_TRANSIT))
    }

    @Test
    fun `canAddExpense is true for DELIVERED`() {
        assertTrue(ActionPermissions.canAddExpense(TripStatus.DELIVERED))
    }

    @Test
    fun `canAddExpense is false for POD_SUBMITTED (read-only)`() {
        assertFalse(ActionPermissions.canAddExpense(TripStatus.POD_SUBMITTED))
    }

    @Test
    fun `canAddExpense is false for SETTLED (terminal)`() {
        assertFalse(ActionPermissions.canAddExpense(TripStatus.SETTLED))
    }

    @Test
    fun `canAddExpense is false for CANCELLED (terminal)`() {
        assertFalse(ActionPermissions.canAddExpense(TripStatus.CANCELLED))
    }

    // ── canAddDocument ───────────────────────────────────────────────────

    @Test
    fun `canAddDocument is false for DISPATCHED`() {
        assertFalse(ActionPermissions.canAddDocument(TripStatus.DISPATCHED))
    }

    @Test
    fun `canAddDocument is true for AT_ORIGIN`() {
        assertTrue(ActionPermissions.canAddDocument(TripStatus.AT_ORIGIN))
    }

    @Test
    fun `canAddDocument is false for POD_VERIFIED (read-only)`() {
        assertFalse(ActionPermissions.canAddDocument(TripStatus.POD_VERIFIED))
    }

    // ── canReportException ───────────────────────────────────────────────

    @Test
    fun `canReportException is false for DISPATCHED (accept phase)`() {
        assertFalse(ActionPermissions.canReportException(TripStatus.DISPATCHED))
    }

    @Test
    fun `canReportException is true for DEPARTED`() {
        assertTrue(ActionPermissions.canReportException(TripStatus.DEPARTED))
    }

    @Test
    fun `canReportException is false for VEHICLE_BREAKDOWN (already exception)`() {
        assertFalse(ActionPermissions.canReportException(TripStatus.VEHICLE_BREAKDOWN))
    }

    @Test
    fun `canReportException is false for ACCIDENT (already exception)`() {
        assertFalse(ActionPermissions.canReportException(TripStatus.ACCIDENT))
    }

    @Test
    fun `canReportException is false for POD_SUBMITTED (read-only)`() {
        assertFalse(ActionPermissions.canReportException(TripStatus.POD_SUBMITTED))
    }

    // ── canLogCheckpoint ─────────────────────────────────────────────────

    @Test
    fun `canLogCheckpoint is true for DEPARTED`() {
        assertTrue(ActionPermissions.canLogCheckpoint(TripStatus.DEPARTED))
    }

    @Test
    fun `canLogCheckpoint is true for IN_TRANSIT`() {
        assertTrue(ActionPermissions.canLogCheckpoint(TripStatus.IN_TRANSIT))
    }

    @Test
    fun `canLogCheckpoint is true for AT_CHECKPOINT`() {
        assertTrue(ActionPermissions.canLogCheckpoint(TripStatus.AT_CHECKPOINT))
    }

    @Test
    fun `canLogCheckpoint is false for ACCEPTED`() {
        assertFalse(ActionPermissions.canLogCheckpoint(TripStatus.ACCEPTED))
    }

    @Test
    fun `canLogCheckpoint is false for LOADING`() {
        assertFalse(ActionPermissions.canLogCheckpoint(TripStatus.LOADING))
    }

    @Test
    fun `canLogCheckpoint is false for DELIVERED`() {
        assertFalse(ActionPermissions.canLogCheckpoint(TripStatus.DELIVERED))
    }

    // ── canViewRecords ───────────────────────────────────────────────────

    @Test
    fun `canViewRecords is true for DISPATCHED`() {
        assertTrue(ActionPermissions.canViewRecords(TripStatus.DISPATCHED))
    }

    @Test
    fun `canViewRecords is true for POD_SUBMITTED (read-only but viewable)`() {
        assertTrue(ActionPermissions.canViewRecords(TripStatus.POD_SUBMITTED))
    }

    @Test
    fun `canViewRecords is true for SETTLED`() {
        assertTrue(ActionPermissions.canViewRecords(TripStatus.SETTLED))
    }

    @Test
    fun `canViewRecords is false for DRAFT (not driver-visible)`() {
        assertFalse(ActionPermissions.canViewRecords(TripStatus.DRAFT))
    }

    @Test
    fun `canViewRecords is false for CREATED (not driver-visible)`() {
        assertFalse(ActionPermissions.canViewRecords(TripStatus.CREATED))
    }

    // ── showPrimaryCta ───────────────────────────────────────────────────

    @Test
    fun `showPrimaryCta is true for DISPATCHED`() {
        assertTrue(ActionPermissions.showPrimaryCta(TripStatus.DISPATCHED))
    }

    @Test
    fun `showPrimaryCta is true for LOADING`() {
        assertTrue(ActionPermissions.showPrimaryCta(TripStatus.LOADING))
    }

    @Test
    fun `showPrimaryCta is false for POD_SUBMITTED`() {
        assertFalse(ActionPermissions.showPrimaryCta(TripStatus.POD_SUBMITTED))
    }

    @Test
    fun `showPrimaryCta is false for CANCELLED`() {
        assertFalse(ActionPermissions.showPrimaryCta(TripStatus.CANCELLED))
    }

    // ── showProgressIndicator ────────────────────────────────────────────

    @Test
    fun `showProgressIndicator is true for ACCEPTED`() {
        assertTrue(ActionPermissions.showProgressIndicator(TripStatus.ACCEPTED))
    }

    @Test
    fun `showProgressIndicator is false for VEHICLE_BREAKDOWN (exception)`() {
        assertFalse(ActionPermissions.showProgressIndicator(TripStatus.VEHICLE_BREAKDOWN))
    }

    @Test
    fun `showProgressIndicator is false for POD_VERIFIED (read-only)`() {
        assertFalse(ActionPermissions.showProgressIndicator(TripStatus.POD_VERIFIED))
    }
}
