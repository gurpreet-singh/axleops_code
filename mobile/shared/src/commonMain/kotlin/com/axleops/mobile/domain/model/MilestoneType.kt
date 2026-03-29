package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The 10 milestone types in the trip lifecycle, in sequential order.
 *
 * Source: [trip.md §2.2](file:///Users/ankit/a/fleetly/axleops_code/trip.md)
 * These map 1:1 to the [TripStatus] sub-states the driver progresses through.
 *
 * Each milestone type has a [driverLabel] for UI display and a [sequence]
 * number (1–10) for ordering in the stepper component.
 */
@Serializable
enum class MilestoneType(
    /** Display label for the driver. */
    val driverLabel: String,
    /** Fixed 1-based position in the lifecycle sequence. */
    val sequence: Int,
) {
    /** Trip dispatched to driver. */
    @SerialName("DISPATCH")
    DISPATCH("Dispatched", 1),

    /** Driver accepted the trip. */
    @SerialName("ACCEPT")
    ACCEPT("Accepted", 2),

    /** Driver arrived at origin / loading point. */
    @SerialName("ARRIVE_ORIGIN")
    ARRIVE_ORIGIN("At Origin", 3),

    /** Loading started. */
    @SerialName("START_LOADING")
    START_LOADING("Loading", 4),

    /** Loading complete — weight verified, sealed. */
    @SerialName("LOADING_COMPLETE")
    LOADING_COMPLETE("Loaded", 5),

    /** Vehicle departed origin. GPS tracking starts. */
    @SerialName("DEPART")
    DEPART("Departed", 6),

    /** Driver arrived at destination. */
    @SerialName("ARRIVE_DESTINATION")
    ARRIVE_DESTINATION("At Destination", 7),

    /** Unloading started. */
    @SerialName("START_UNLOADING")
    START_UNLOADING("Unloading", 8),

    /** Delivery complete — weight verified, cargo handed over. */
    @SerialName("DELIVERY_COMPLETE")
    DELIVERY_COMPLETE("Delivered", 9),

    /** POD submitted by the driver. */
    @SerialName("SUBMIT_POD")
    SUBMIT_POD("POD Submitted", 10),
    ;

    companion object {
        /** Total number of milestones in the lifecycle. */
        const val TOTAL_COUNT = 10

        /** Ordered list of all milestone types. */
        val ordered: List<MilestoneType> = entries.sortedBy { it.sequence }
    }
}
