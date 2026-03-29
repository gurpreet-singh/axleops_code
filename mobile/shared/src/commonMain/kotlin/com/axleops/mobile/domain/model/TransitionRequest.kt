package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Payload for a milestone state transition request.
 *
 * Sent to `POST /trips/{id}/transition` (derived contract).
 * The backend validates the transition and returns the updated trip state.
 *
 * Source: plan §2, spec FR-020–FR-028, FR-110–FR-114 (audit trail)
 */
@Serializable
data class TransitionRequest(
    /** The transition event being requested (e.g., "START_LOADING", "DEPART"). */
    val event: String,

    /** ISO-8601 timestamp when the driver triggered the action. */
    val timestamp: String,

    /** GPS latitude at time of transition. Null if GPS unavailable. */
    val latitude: Double? = null,

    /** GPS longitude at time of transition. Null if GPS unavailable. */
    val longitude: Double? = null,

    /** GPS accuracy in meters. Null if GPS unavailable. */
    @SerialName("gps_accuracy")
    val gpsAccuracy: Double? = null,

    /**
     * Key-value data captured with this transition.
     *
     * Examples:
     * - LOADING_COMPLETE: {"actual_weight_mt": "22.5", "seal_number": "SL-1234"}
     * - DELIVERY_COMPLETE: {"delivered_weight_mt": "22.3", "cargo_condition": "GOOD"}
     */
    @SerialName("captured_data")
    val capturedData: Map<String, String> = emptyMap(),

    /** IDs of evidence files captured with this transition (photos, etc.). */
    @SerialName("evidence_ids")
    val evidenceIds: List<String> = emptyList(),

    /** Additional notes from the driver. Optional. */
    val notes: String? = null,
)
