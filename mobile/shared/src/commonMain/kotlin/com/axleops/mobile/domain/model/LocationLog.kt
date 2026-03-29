package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * A GPS location data point captured during background tracking.
 *
 * Source: spec Story 6, FR-050–FR-055
 *
 * Points are logged every 5 minutes during IN_TRANSIT and batched
 * for upload to the location API. Points captured offline are stored
 * locally and sent in the next batch when connectivity returns.
 */
@Serializable
data class LocationLog(
    /** GPS latitude in decimal degrees. */
    val latitude: Double,

    /** GPS longitude in decimal degrees. */
    val longitude: Double,

    /** ISO-8601 timestamp when this point was captured. */
    val timestamp: String,

    /** GPS accuracy in meters. Lower is better. */
    @SerialName("accuracy_meters")
    val accuracyMeters: Double? = null,

    /** Speed in km/h at time of capture. Null if not available. */
    @SerialName("speed_kmh")
    val speedKmh: Double? = null,

    /** Battery level (0.0–1.0) at time of capture. Null if not available. */
    @SerialName("battery_level")
    val batteryLevel: Double? = null,

    /** Whether this point has been synced to the server. */
    @SerialName("is_synced")
    val isSynced: Boolean = false,
)
