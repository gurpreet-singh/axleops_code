package com.axleops.mobile.platform

/**
 * iOS [PermissionHandler] — stub implementation.
 *
 * Full implementation requires AVCaptureDevice.requestAccess and
 * PHPhotoLibrary.requestAuthorization. Will be completed in the
 * Upload Service epic (Phase 8) alongside CameraCapture/GalleryPicker.
 *
 * For now, returns false (permission not granted) to satisfy the
 * expect/actual contract.
 */
actual class PermissionHandler {
    actual suspend fun requestCameraPermission(): Boolean {
        // TODO: Wire via AVCaptureDevice.requestAccess in Upload epic
        return false
    }

    actual suspend fun requestGalleryPermission(): Boolean {
        // TODO: Wire via PHPhotoLibrary.requestAuthorization in Upload epic
        return false
    }
}
