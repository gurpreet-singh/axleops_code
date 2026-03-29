package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.TripException
import com.axleops.mobile.domain.repository.TripExceptionRepository
import io.ktor.client.HttpClient

/**
 * Real [TripExceptionRepository] — backend-backed.
 *
 * Backend gap G6: Exception API does not exist yet.
 */
class RealTripExceptionRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : TripExceptionRepository {

    override suspend fun reportException(tripId: Long, exception: TripException): TripException =
        throw UnsupportedOperationException("Backend exception API not available (gap G6)")

    override suspend fun getExceptions(tripId: Long): List<TripException> = emptyList()
}
