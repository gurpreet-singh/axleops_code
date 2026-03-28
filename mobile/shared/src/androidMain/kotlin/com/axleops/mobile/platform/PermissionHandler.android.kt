package com.axleops.mobile.platform

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

/**
 * Android [PermissionHandler] — checks permission status.
 *
 * NOTE: This checks existing permission state only. Actual runtime permission
 * requests require Activity context and ActivityResultContracts, which will
 * be wired in the Upload Service epic (Phase 8).
 *
 * For now, returns the current grant status without prompting the user.
 */
actual class PermissionHandler(
    private val context: Context,
) {
    actual suspend fun requestCameraPermission(): Boolean {
        // Check current permission state — runtime request needs Activity context
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA,
        ) == PackageManager.PERMISSION_GRANTED
    }

    actual suspend fun requestGalleryPermission(): Boolean {
        // READ_MEDIA_IMAGES for API 33+, READ_EXTERNAL_STORAGE for older
        val permission = if (android.os.Build.VERSION.SDK_INT >= 33) {
            Manifest.permission.READ_MEDIA_IMAGES
        } else {
            @Suppress("DEPRECATION")
            Manifest.permission.READ_EXTERNAL_STORAGE
        }
        return ContextCompat.checkSelfPermission(
            context,
            permission,
        ) == PackageManager.PERMISSION_GRANTED
    }
}
