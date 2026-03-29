package com.axleops.mobile.platform

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.axleops.mobile.tracking.model.LocationPermissionState

/**
 * Android implementation of [LocationPermissionHandler].
 *
 * Checks permission state using [ContextCompat.checkSelfPermission].
 *
 * ## Limitation (current)
 * Runtime permission *requests* require an Activity context and
 * [ActivityResultContracts]. The current implementation checks
 * existing permission state and returns the appropriate
 * [LocationPermissionState] without prompting the OS dialog.
 *
 * The actual OS dialog triggering will be wired in the UI layer
 * (permission pre-prompt composable → Activity result launcher)
 * and the result will be fed back through this handler.
 *
 * ## Permission levels
 * - `ACCESS_FINE_LOCATION` → foreground location
 * - `ACCESS_BACKGROUND_LOCATION` (Android 10+) → background location
 * - `shouldShowRequestPermissionRationale` → distinguishes Denied vs PermanentlyDenied
 *
 * Source: spec §4.1, plan §4
 */
actual class LocationPermissionHandler(
    private val context: Context,
) {
    actual suspend fun checkCurrentState(): LocationPermissionState {
        val hasFine = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION,
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasFine) {
            // Fine location not granted — check if we can determine permanent denial.
            // Without Activity context we cannot call shouldShowRequestPermissionRationale,
            // so we conservatively return Denied (not PermanentlyDenied).
            // The UI layer with Activity context will refine this when needed.
            return LocationPermissionState.Denied
        }

        // Fine location is granted — check background
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val hasBackground = ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_BACKGROUND_LOCATION,
            ) == PackageManager.PERMISSION_GRANTED

            return if (hasBackground) {
                LocationPermissionState.ForegroundAndBackground
            } else {
                LocationPermissionState.ForegroundOnly
            }
        }

        // Pre-Android 10: foreground permission implies background access
        return LocationPermissionState.ForegroundAndBackground
    }

    actual suspend fun requestForegroundPermission(): LocationPermissionState {
        // NOTE: Actual runtime request requires Activity context + ActivityResultContracts.
        // This method currently checks state only. The UI composable will handle the
        // actual request via rememberLauncherForActivityResult and then call
        // checkCurrentState() to get the updated result.
        return checkCurrentState()
    }

    actual suspend fun requestBackgroundPermission(): LocationPermissionState {
        // NOTE: Same as above — actual request needs Activity context.
        // On Android 10+, background permission is requested as a separate step
        // after foreground is already granted. The UI layer handles this flow.
        return checkCurrentState()
    }

    actual fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.fromParts("package", context.packageName, null)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    actual fun isDeviceLocationEnabled(): Boolean {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            ?: return false
        return locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) ||
            locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
    }
}
