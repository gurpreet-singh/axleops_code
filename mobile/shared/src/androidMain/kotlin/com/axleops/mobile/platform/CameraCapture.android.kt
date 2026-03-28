package com.axleops.mobile.platform

/**
 * Android [CameraCapture] — stub implementation.
 *
 * Full implementation requires Activity Result API integration which must be
 * registered in the Activity's lifecycle. This will be completed in the
 * Upload Service epic (Phase 8, T039–T045) when the UploadViewModel
 * provides the Activity context bridge.
 *
 * For now, returns null (simulating user cancellation) to satisfy the
 * expect/actual contract and enable compilation.
 */
actual class CameraCapture {
    actual suspend fun capturePhoto(): ByteArray? {
        // TODO: Wire via Activity Result API in Upload epic
        // ActivityResultContracts.TakePicture() → save to temp file → read bytes
        return null
    }
}
