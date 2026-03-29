package com.axleops.mobile.data.local

import com.axleops.mobile.domain.model.TripDetail
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Local cache for last-fetched TripDetail.
 *
 * Enables offline viewing of the active trip when the network
 * is unavailable. Cache is updated on every successful API fetch.
 *
 * Current: in-memory. Future: persist via kotlinx.serialization + file.
 *
 * Source: spec FR-103, plan §9
 */
class TripLocalCache {

    private val _cached = MutableStateFlow<TripDetail?>(null)
    val cached: StateFlow<TripDetail?> = _cached.asStateFlow()

    /** Store/update the cached trip detail. */
    fun put(trip: TripDetail) {
        _cached.value = trip
    }

    /** Retrieve the cached trip detail. */
    fun get(): TripDetail? = _cached.value

    /** Clear the cache (e.g., on logout). */
    fun clear() {
        _cached.value = null
    }
}
