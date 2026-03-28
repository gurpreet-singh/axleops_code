package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Role-agnostic Trip domain model.
 *
 * Derived from the backend `Trip` entity shape. This model
 * is used by both Driver and future roles (e.g., Operations Executive)
 * — role-specific filtering happens at the query/ViewModel layer,
 * not in the model itself.
 *
 * Fields match the closest backend contract for `GET /trips`.
 */
@Serializable
data class Trip(
    val id: Long,

    @SerialName("trip_number")
    val tripNumber: String = "",

    val status: TripStatus = TripStatus.CREATED,

    @SerialName("origin_city")
    val originCity: String = "",

    @SerialName("destination_city")
    val destinationCity: String = "",

    @SerialName("start_date")
    val startDate: String? = null,

    @SerialName("end_date")
    val endDate: String? = null,

    @SerialName("driver_id")
    val driverId: Long? = null,

    @SerialName("driver_name")
    val driverName: String? = null,

    @SerialName("vehicle_id")
    val vehicleId: Long? = null,

    @SerialName("vehicle_number")
    val vehicleNumber: String? = null,

    @SerialName("branch_id")
    val branchId: Long? = null,

    @SerialName("customer_name")
    val customerName: String? = null,

    @SerialName("total_distance_km")
    val totalDistanceKm: Double? = null,

    @SerialName("freight_amount")
    val freightAmount: Double? = null,
)

/**
 * Trip lifecycle status.
 * Derived from backend `TripStatus` enum.
 */
@Serializable
enum class TripStatus {
    @SerialName("CREATED") CREATED,
    @SerialName("DISPATCHED") DISPATCHED,
    @SerialName("IN_TRANSIT") IN_TRANSIT,
    @SerialName("DELIVERED") DELIVERED,
    @SerialName("COMPLETED") COMPLETED,
    @SerialName("CANCELLED") CANCELLED,
}
