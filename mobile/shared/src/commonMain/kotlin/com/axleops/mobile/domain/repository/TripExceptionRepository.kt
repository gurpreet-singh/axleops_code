package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.TripException

/**
 * Repository interface for trip exception reporting.
 *
 * Backend gap G6: Exception reporting API does not exist yet.
 *
 * Source: spec FR-080–FR-084
 */
interface TripExceptionRepository {

    /** Report an exception for a trip. Returns the created exception. */
    suspend fun reportException(tripId: Long, exception: TripException): TripException

    /** Get all exceptions for a trip. */
    suspend fun getExceptions(tripId: Long): List<TripException>
}
