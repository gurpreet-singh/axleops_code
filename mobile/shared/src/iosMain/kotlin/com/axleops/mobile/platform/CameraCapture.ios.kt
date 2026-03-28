package com.axleops.mobile.platform

/**
 * iOS [CameraCapture] — stub implementation.
 *
 * Full implementation requires UIImagePickerController presentation from
 * the active UIViewController. This will be completed in the Upload
 * Service epic (Phase 8) when the iOS platform bridge is established.
 */
actual class CameraCapture {
    actual suspend fun capturePhoto(): ByteArray? {
        // TODO: Wire via UIImagePickerController in Upload epic
        return null
    }
}
