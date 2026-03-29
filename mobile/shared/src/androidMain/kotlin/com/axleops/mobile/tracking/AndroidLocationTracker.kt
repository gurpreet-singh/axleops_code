package com.axleops.mobile.tracking

import android.annotation.SuppressLint
import android.content.Context
import android.os.Looper
import com.axleops.mobile.platform.GpsLocation
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Android [LocationTracker] using Google Play Services' FusedLocationProviderClient.
 *
 * ## Architecture
 * - Uses [FusedLocationProviderClient] for best-in-class location on Android
 * - `PRIORITY_HIGH_ACCURACY` for GPS-grade precision
 * - Emits updates via [lastLocation] StateFlow, consumed by TrackingManager
 * - Fastest interval is 80% of configured interval (slight margin for battery)
 * - Delegates ForegroundService lifecycle to [onServiceStart] / [onServiceStop] callbacks
 *   (injected by the app layer to avoid cross-module dependency)
 *
 * ## Permission Requirement
 * Caller must ensure `ACCESS_FINE_LOCATION` is granted before calling [startTracking].
 * `ACCESS_BACKGROUND_LOCATION` is additionally required for background updates (Android 10+).
 *
 * Source: spec §3.1, §9.1, plan §2
 */
class AndroidLocationTracker(
    private val context: Context,
) : LocationTracker {

    private val fusedClient: FusedLocationProviderClient by lazy {
        LocationServices.getFusedLocationProviderClient(context)
    }

    private val _lastLocation = MutableStateFlow<GpsLocation?>(null)
    override val lastLocation: Flow<GpsLocation?> = _lastLocation.asStateFlow()

    private val _isTracking = MutableStateFlow(false)
    override val isTracking: StateFlow<Boolean> = _isTracking.asStateFlow()

    private var locationCallback: LocationCallback? = null

    /**
     * T024: ForegroundService bridge callbacks.
     * Set by the app layer (composeApp) to start/stop LocationTrackingService
     * without creating a cross-module dependency from shared → composeApp.
     */
    var onServiceStart: ((tripNumber: String) -> Unit)? = null
    var onServiceStop: (() -> Unit)? = null

    /**
     * FX-015: Notification content update bridge callback.
     * Called by TrackingManager when tracking state changes to update
     * the foreground notification text (e.g., "Location tracking active" →
     * "GPS signal lost — tracking will resume").
     */
    var onNotificationUpdate: ((text: String) -> Unit)? = null

    /** Trip number for notification display. */
    var tripNumber: String = "Trip"

    @SuppressLint("MissingPermission")
    override fun startTracking(intervalMs: Long) {
        if (_isTracking.value) return

        // T024: Start ForegroundService via bridge callback
        onServiceStart?.invoke(tripNumber)

        val request = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            intervalMs,
        ).apply {
            setMinUpdateIntervalMillis((intervalMs * 0.8).toLong())
            setWaitForAccurateLocation(false)
        }.build()

        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val location = result.lastLocation ?: return
                _lastLocation.value = GpsLocation(
                    latitude = location.latitude,
                    longitude = location.longitude,
                    accuracyMeters = location.accuracy.toDouble(),
                    timestampMs = location.time,
                )
            }
        }
        locationCallback = callback

        fusedClient.requestLocationUpdates(
            request,
            callback,
            Looper.getMainLooper(),
        )
        _isTracking.value = true
        println("[AndroidLocationTracker] Started (interval: ${intervalMs}ms)")
    }

    override fun stopTracking() {
        locationCallback?.let { callback ->
            fusedClient.removeLocationUpdates(callback)
        }
        locationCallback = null
        _isTracking.value = false

        // T024: Stop ForegroundService via bridge callback
        onServiceStop?.invoke()
        println("[AndroidLocationTracker] Stopped")
    }
}


