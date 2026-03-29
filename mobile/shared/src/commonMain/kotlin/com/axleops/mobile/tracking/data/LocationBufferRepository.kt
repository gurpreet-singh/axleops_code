package com.axleops.mobile.tracking.data

import com.axleops.mobile.db.AxleOpsDatabase
import com.axleops.mobile.db.BufferedLocationPoint
import com.axleops.mobile.domain.repository.LocationPoint
import app.cash.sqldelight.coroutines.asFlow
import app.cash.sqldelight.coroutines.mapToOne
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import kotlinx.datetime.Clock

/**
 * Repository wrapping the SQLDelight [BufferedLocationPoint] DAO.
 *
 * All location points captured by the tracking system are written here
 * before any network sync is attempted (write-through pattern).
 * Points remain in the buffer until successfully synced and confirmed.
 *
 * Source: plan §6, spec §7.4
 */
class LocationBufferRepository(
    private val database: AxleOpsDatabase,
) {
    private val queries get() = database.locationBufferQueries

    /**
     * Insert a new captured location point into the buffer.
     *
     * Uses INSERT OR IGNORE to handle idempotent retries — if a point
     * with the same clientId already exists, the insert is silently skipped.
     */
    suspend fun insert(point: LocationPoint, tripId: Long) {
        withContext(Dispatchers.Default) {
            queries.insertPoint(
                clientId = point.clientId,
                tripId = tripId,
                latitude = point.latitude,
                longitude = point.longitude,
                accuracy = point.accuracy,
                timestamp = point.timestamp,
                speed = point.speed,
                bearing = point.bearing,
                altitude = point.altitude,
                provider = point.provider,
                batteryLevel = point.batteryLevel?.toLong(),
                capturedAt = Clock.System.now().toString(),
            )
        }
    }

    /**
     * Get pending (unsynced) points for a trip, ordered oldest first.
     *
     * @param tripId The trip to query pending points for.
     * @param limit Maximum number of points to return (default 50 per spec §7.2).
     * @return List of [BufferedLocationPoint] entities.
     */
    suspend fun getPending(tripId: Long, limit: Int = 50): List<BufferedLocationPoint> {
        return withContext(Dispatchers.Default) {
            queries.getPendingByTrip(tripId = tripId, value_ = limit.toLong())
                .executeAsList()
        }
    }

    /**
     * Reactive count of all pending (unsynced) points.
     * UI observes this to show/hide the pending sync badge.
     */
    fun pendingCount(): Flow<Long> {
        return queries.pendingCount()
            .asFlow()
            .mapToOne(Dispatchers.Default)
    }

    /**
     * Mark specific points as successfully synced.
     *
     * @param clientIds List of clientId values that were accepted by the backend.
     */
    suspend fun markSynced(clientIds: List<String>) {
        if (clientIds.isEmpty()) return
        withContext(Dispatchers.Default) {
            queries.markSynced(clientIds)
        }
    }

    /**
     * Delete all synced points to free local storage.
     * Called periodically after successful batch sync rounds.
     */
    suspend fun deleteSynced() {
        withContext(Dispatchers.Default) {
            queries.deleteSynced()
        }
    }

    /**
     * Increment the sync attempt counter for points that failed to sync.
     *
     * @param clientIds List of clientId values whose sync attempt failed.
     */
    suspend fun incrementSyncAttempts(clientIds: List<String>) {
        if (clientIds.isEmpty()) return
        withContext(Dispatchers.Default) {
            queries.incrementSyncAttempts(clientIds)
        }
    }

    /**
     * Calculate how many hours of data are in the buffer.
     * Used for the 24-hour threshold diagnostic.
     *
     * @return Hours between the oldest pending point and now, or 0.0 if empty.
     */
    suspend fun totalBufferedHours(): Double {
        return withContext(Dispatchers.Default) {
            val oldest = queries.oldestPendingTimestamp().executeAsOneOrNull()
                ?.MIN ?: return@withContext 0.0

            try {
                val oldestInstant = kotlinx.datetime.Instant.parse(oldest)
                val now = Clock.System.now()
                val durationMs = (now - oldestInstant).inWholeMilliseconds
                durationMs / (1000.0 * 60.0 * 60.0)
            } catch (_: Exception) {
                0.0
            }
        }
    }
}
