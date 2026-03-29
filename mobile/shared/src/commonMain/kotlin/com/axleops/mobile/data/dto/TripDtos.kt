package com.axleops.mobile.data.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * DTOs for the Active Trip API responses.
 *
 * These match the closest sensible backend contract shape.
 * Backend gap: Most of these endpoints don't exist yet.
 * The DTOs define the wire format that mock fixtures produce
 * and that real implementations will parse once backend catches up.
 */

// ── Trip Detail Response ─────────────────────────────────────────────────

/**
 * Full trip detail response from `GET /trips/{id}` (enriched) or
 * `GET /trips/driver/active` (derived contract).
 */
@Serializable
data class TripDetailDto(
    val id: Long,
    @SerialName("trip_number") val tripNumber: String = "",
    val status: String = "CREATED",
    @SerialName("origin_city") val originCity: String = "",
    @SerialName("destination_city") val destinationCity: String = "",
    @SerialName("origin_address") val originAddress: String? = null,
    @SerialName("destination_address") val destinationAddress: String? = null,
    @SerialName("origin_lat") val originLat: Double? = null,
    @SerialName("origin_lng") val originLng: Double? = null,
    @SerialName("destination_lat") val destinationLat: Double? = null,
    @SerialName("destination_lng") val destinationLng: Double? = null,
    @SerialName("start_date") val startDate: String? = null,
    @SerialName("end_date") val endDate: String? = null,
    @SerialName("expected_delivery_date") val expectedDeliveryDate: String? = null,
    @SerialName("driver_id") val driverId: Long? = null,
    @SerialName("driver_name") val driverName: String? = null,
    @SerialName("vehicle_id") val vehicleId: Long? = null,
    @SerialName("vehicle_number") val vehicleNumber: String? = null,
    @SerialName("branch_id") val branchId: Long? = null,
    @SerialName("customer_name") val customerName: String? = null,
    @SerialName("cargo_description") val cargoDescription: String? = null,
    @SerialName("booked_weight_mt") val bookedWeightMt: Double? = null,
    @SerialName("actual_weight_mt") val actualWeightMt: Double? = null,
    @SerialName("delivered_weight_mt") val deliveredWeightMt: Double? = null,
    @SerialName("consignment_value") val consignmentValue: Double? = null,
    @SerialName("lr_number") val lrNumber: String? = null,
    @SerialName("total_distance_km") val totalDistanceKm: Double? = null,
    @SerialName("freight_amount") val freightAmount: Double? = null,
    @SerialName("budget_estimate") val budgetEstimate: Double? = null,
    @SerialName("dispatched_at") val dispatchedAt: String? = null,
    @SerialName("accepted_at") val acceptedAt: String? = null,
    @SerialName("accept_timeout_minutes") val acceptTimeoutMinutes: Int = 30,
    val milestones: List<MilestoneDto> = emptyList(),
    @SerialName("seal_number") val sealNumber: String? = null,
    @SerialName("cargo_condition") val cargoCondition: String? = null,
)

// ── Milestone Response ───────────────────────────────────────────────────

/**
 * Milestone DTO from `GET /trips/{id}/milestones` or embedded in [TripDetailDto].
 */
@Serializable
data class MilestoneDto(
    val id: Long = 0,
    val type: String,
    @SerialName("sequence_number") val sequenceNumber: Int,
    val status: String = "UPCOMING",
    @SerialName("completed_at") val completedAt: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    @SerialName("gps_accuracy") val gpsAccuracy: Double? = null,
    @SerialName("captured_data") val capturedData: Map<String, String> = emptyMap(),
    @SerialName("evidence_ids") val evidenceIds: List<String> = emptyList(),
    @SerialName("completed_by") val completedBy: Long? = null,
)

// ── Transition Request/Response ──────────────────────────────────────────

/**
 * Request body for `POST /trips/{id}/transition`.
 */
@Serializable
data class TransitionRequestDto(
    val event: String,
    val timestamp: String,
    val latitude: Double? = null,
    val longitude: Double? = null,
    @SerialName("gps_accuracy") val gpsAccuracy: Double? = null,
    @SerialName("captured_data") val capturedData: Map<String, String> = emptyMap(),
    @SerialName("evidence_ids") val evidenceIds: List<String> = emptyList(),
    val notes: String? = null,
)

// ── Accept/Reject Request ────────────────────────────────────────────────

/**
 * Request body for `POST /trips/{id}/reject`.
 */
@Serializable
data class RejectTripRequestDto(
    val reason: String,
)
