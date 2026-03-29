package com.axleops.mobile.tracking

import com.axleops.mobile.domain.repository.LocationPoint
import com.axleops.mobile.domain.repository.LocationRepository
import com.axleops.mobile.platform.LocationProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

/**
 * GPS tracking manager.
 *
 * Starts/stops periodic GPS collection during IN_TRANSIT.
 * Batches points and submits to [LocationRepository] every
 * [batchIntervalMs] milliseconds.
 *
 * Source: spec FR-110–FR-113, plan §10
 */
class TrackingManager(
    private val locationProvider: LocationProvider,
    private val locationRepository: LocationRepository,
    private val trackingIntervalMs: Long = 5 * 60 * 1000L, // 5 minutes
    private val batchIntervalMs: Long = 15 * 60 * 1000L,   // 15 minutes
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private var trackingJob: Job? = null
    private var batchJob: Job? = null
    private var activeTripId: Long? = null

    private val buffer = mutableListOf<LocationPoint>()

    private val _isTracking = MutableStateFlow(false)
    val isTracking: StateFlow<Boolean> = _isTracking.asStateFlow()

    /**
     * Start GPS tracking for a trip.
     */
    fun start(tripId: Long) {
        if (trackingJob?.isActive == true) return
        activeTripId = tripId
        _isTracking.value = true

        trackingJob = scope.launch {
            while (isActive) {
                try {
                    val location = locationProvider.getCurrentLocation()
                    if (location != null) {
                        synchronized(buffer) {
                            buffer.add(
                                LocationPoint(
                                    latitude = location.latitude,
                                    longitude = location.longitude,
                                    accuracy = location.accuracyMeters,
                                    timestamp = Clock.System.now().toString(),
                                )
                            )
                        }
                    }
                } catch (_: Exception) {
                    // GPS capture failed, continue
                }
                delay(trackingIntervalMs)
            }
        }

        batchJob = scope.launch {
            while (isActive) {
                delay(batchIntervalMs)
                flushBatch()
            }
        }
    }

    /**
     * Stop GPS tracking and flush remaining points.
     */
    fun stop() {
        trackingJob?.cancel()
        batchJob?.cancel()
        trackingJob = null
        batchJob = null
        _isTracking.value = false

        // Flush remaining buffer
        scope.launch { flushBatch() }
    }

    private suspend fun flushBatch() {
        val tripId = activeTripId ?: return
        val points: List<LocationPoint>
        synchronized(buffer) {
            points = buffer.toList()
            buffer.clear()
        }
        if (points.isNotEmpty()) {
            try {
                locationRepository.batchLog(tripId, points)
            } catch (_: Exception) {
                // Re-buffer on failure
                synchronized(buffer) {
                    buffer.addAll(0, points)
                }
            }
        }
    }
}
