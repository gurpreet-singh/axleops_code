package com.axleops.mobile.domain.repository

import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * A single GPS location data point captured during trip tracking.
 *
 * All 9 spec-required fields (§7.1) plus a client-generated [clientId]
 * for idempotent deduplication on batch retry.
 *
 * Source: spec §7.1, plan §1
 */
data class LocationPoint(
    /** Client-generated UUID v4 for deduplication. Unique per captured point. */
    val clientId: String,
    /** WGS84 latitude. */
    val latitude: Double,
    /** WGS84 longitude. */
    val longitude: Double,
    /** Horizontal accuracy in meters. */
    val accuracy: Double,
    /** ISO-8601 timestamp of the GPS fix (device clock). */
    val timestamp: String,
    /** Speed in m/s at time of fix. Null if unavailable from platform. */
    val speed: Double? = null,
    /** Heading in degrees (0–360). Null if unavailable from platform. */
    val bearing: Double? = null,
    /** Altitude in meters above sea level. Null if unavailable. */
    val altitude: Double? = null,
    /** Location source identifier: GPS, Network, Fused, Passive. */
    val provider: String? = null,
    /** Device battery percentage at time of capture (0–100). Null if unavailable. */
    val batteryLevel: Int? = null,
) {
    companion object {
        /**
         * Generate a new random client ID for a location point.
         */
        @OptIn(ExperimentalUuidApi::class)
        fun generateClientId(): String = Uuid.random().toString()
    }
}

/**
 * Result of a batch location log submission.
 *
 * Source: spec §8.3 derived contract response
 */
data class BatchLogResult(
    /** Number of points accepted by the backend. */
    val accepted: Int,
    /** Number of duplicate points detected (by clientId). */
    val duplicates: Int,
)

/**
 * Repository interface for batch GPS location logging.
 *
 * Logs GPS points collected during the IN_TRANSIT phase of a trip.
 * Implementations: [MockLocationRepository], [RealLocationRepository].
 *
 * Source: spec §7.2, plan §8
 */
interface LocationRepository {
    /**
     * Submit a batch of location points for a trip.
     *
     * @param tripId The trip this batch belongs to.
     * @param points Ordered list of location points to submit.
     * @return [BatchLogResult] with accepted/duplicate counts.
     * @throws Exception on network or server error (caller handles retry).
     */
    suspend fun batchLog(tripId: Long, points: List<LocationPoint>): BatchLogResult
}
