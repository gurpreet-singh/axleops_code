package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Proof of Delivery (POD) data submitted by the driver at delivery.
 *
 * Source: spec Story 4, FR-030–FR-035
 *
 * POD is a multi-step capture: photos → signature → consignee info → submit.
 * Once submitted, the trip transitions to POD_SUBMITTED and becomes read-only.
 * Resubmission after rejection is deferred to a future feature (clarification Q5).
 */
@Serializable
data class Pod(
    /** Server-assigned ID. 0 for locally-created. */
    val id: Long = 0,

    /** Trip this POD belongs to. */
    @SerialName("trip_id")
    val tripId: Long,

    /** Type of POD submission. */
    val type: PodType = PodType.DELIVERED,

    // ── Consignee Info ───────────────────────────────────────────────────

    /** Name of the person who received the delivery. Required. */
    @SerialName("consignee_name")
    val consigneeName: String,

    /** Designation/title of the consignee. Optional. */
    @SerialName("consignee_designation")
    val consigneeDesignation: String? = null,

    // ── Delivery Details ─────────────────────────────────────────────────

    /** Received quantity in MT. */
    @SerialName("received_quantity")
    val receivedQuantity: Double? = null,

    /** Condition of received cargo. */
    @SerialName("received_condition")
    val receivedCondition: CargoCondition = CargoCondition.GOOD,

    /** Delivery remarks. Optional. */
    val remarks: String? = null,

    /** Refusal reason — only applicable when type == REFUSED. */
    @SerialName("refusal_reason")
    val refusalReason: String? = null,

    // ── Evidence Files ───────────────────────────────────────────────────

    /** IDs of POD photo files uploaded via UploadService. Min 2 per spec. */
    @SerialName("photo_ids")
    val photoIds: List<String> = emptyList(),

    /** ID of the signature image file. Required. */
    @SerialName("signature_id")
    val signatureId: String? = null,

    // ── Timestamps ───────────────────────────────────────────────────────

    /** ISO-8601 timestamp when POD was submitted. */
    @SerialName("submitted_at")
    val submittedAt: String? = null,

    /** GPS latitude at submission. */
    val latitude: Double? = null,

    /** GPS longitude at submission. */
    val longitude: Double? = null,

    /** Who submitted this POD. */
    @SerialName("submitted_by")
    val submittedBy: Long? = null,

    /** Current POD verification status. */
    @SerialName("verification_status")
    val verificationStatus: PodVerificationStatus = PodVerificationStatus.AWAITING_SUBMISSION,
)

/**
 * Type of POD submission.
 */
@Serializable
enum class PodType {
    /** Normal delivery accepted by consignee. */
    @SerialName("DELIVERED") DELIVERED,
    /** Delivery refused by consignee. */
    @SerialName("REFUSED") REFUSED,
}

/**
 * Cargo condition at delivery.
 *
 * Source: spec FR-026, FR-031
 */
@Serializable
enum class CargoCondition(val displayLabel: String) {
    @SerialName("GOOD") GOOD("Good"),
    @SerialName("DAMAGED") DAMAGED("Damaged"),
    @SerialName("PARTIAL_DAMAGE") PARTIAL_DAMAGE("Partial Damage"),
}

/**
 * POD verification status (ops-side process).
 *
 * Source: state-inventory.md §3.2
 */
@Serializable
enum class PodVerificationStatus(val driverLabel: String) {
    @SerialName("AWAITING_SUBMISSION") AWAITING_SUBMISSION("Submit POD"),
    @SerialName("SUBMITTED") SUBMITTED("POD Submitted"),
    @SerialName("VERIFICATION_IN_PROGRESS") VERIFICATION_IN_PROGRESS("Under Review"),
    @SerialName("VERIFIED_CLEAN") VERIFIED_CLEAN("Verified"),
    @SerialName("VERIFIED_WITH_REMARKS") VERIFIED_WITH_REMARKS("Verified with Remarks"),
    @SerialName("REJECTED") REJECTED("POD Rejected"),
    @SerialName("DISPUTED") DISPUTED("POD Under Review"),
}
