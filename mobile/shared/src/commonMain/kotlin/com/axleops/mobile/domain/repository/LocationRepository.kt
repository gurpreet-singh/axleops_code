package com.axleops.mobile.domain.repository

/**
 * Location point for GPS batch logging.
 */
data class LocationPoint(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double? = null,
    val speed: Double? = null,
    val bearing: Double? = null,
    val timestamp: String,
)

/**
 * Repository interface for batch GPS location logging.
 *
 * Logs GPS points collected during IN_TRANSIT phase.
 *
 * Source: spec FR-110–FR-113, plan §10
 */
interface LocationRepository {
    suspend fun batchLog(tripId: Long, points: List<LocationPoint>)
}
