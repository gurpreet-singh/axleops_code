package com.axleops.mobile.domain.model

/**
 * Filter criteria for trip queries.
 *
 * Role-specific scoping is applied via these filters:
 * - **Driver**: set [driverId] to current user's contactId
 * - **Operations Executive**: set [branchId] for branch-scoped view
 * - **Admin**: no filters → all trips
 *
 * All fields are optional — omitted fields apply no filtering.
 */
data class TripFilter(
    /** Filter to trips assigned to a specific driver. */
    val driverId: Long? = null,

    /** Filter to trips within a specific branch. */
    val branchId: Long? = null,

    /** Filter to trips with a specific status. */
    val status: TripStatus? = null,

    /** Limit the number of results. */
    val limit: Int = 50,

    /** Offset for pagination. */
    val offset: Int = 0,
)
