package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Driver earnings summary for a given period.
 *
 * ⚠️ Backend gap: No dedicated earnings endpoint exists yet.
 * This model is entirely mock-backed in v1. The shape is derived
 * from the frontend earnings page behavior and trip freight data.
 *
 * When a backend earnings API is added, this model will be updated
 * to match the actual response shape, and [DataSourceConfig.earningsSource]
 * will be switched to [DataSourceMode.REAL].
 */
@Serializable
data class EarningsSummary(
    /** Period label, e.g., "March 2026". */
    val period: String,

    /** Total earnings for the period. */
    @SerialName("total_earnings")
    val totalEarnings: Double = 0.0,

    /** Number of completed trips in the period. */
    @SerialName("trip_count")
    val tripCount: Int = 0,

    /** Total distance driven in the period (km). */
    @SerialName("total_distance_km")
    val totalDistanceKm: Double = 0.0,

    /** Per-trip earnings breakdown. */
    val trips: List<TripEarning> = emptyList(),
)

/**
 * Earnings entry for a single completed trip.
 */
@Serializable
data class TripEarning(
    @SerialName("trip_id")
    val tripId: Long,

    @SerialName("trip_number")
    val tripNumber: String = "",

    val route: String = "",

    @SerialName("completion_date")
    val completionDate: String = "",

    @SerialName("freight_amount")
    val freightAmount: Double = 0.0,

    @SerialName("driver_payout")
    val driverPayout: Double = 0.0,
)
