package com.axleops.mobile.platform

/**
 * Runtime permission handler abstraction.
 *
 * Provides suspend functions to request platform permissions at runtime.
 * Returns true if the permission was granted, false otherwise.
 *
 * Platform implementations:
 * - Android: [ActivityCompat.requestPermissions] / ActivityResultContracts
 * - iOS: [AVCaptureDevice.requestAccess] / [PHPhotoLibrary.requestAuthorization]
 *
 * Foundation-owned but consumed only by CameraCapture and GalleryPicker
 * (which check permissions before launching pickers).
 */
expect class PermissionHandler {

    /**
     * Request camera permission.
     *
     * @return true if camera access was granted.
     */
    suspend fun requestCameraPermission(): Boolean

    /**
     * Request photo library / gallery read permission.
     *
     * @return true if gallery access was granted.
     */
    suspend fun requestGalleryPermission(): Boolean
}
