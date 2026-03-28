package com.axleops.mobile.platform

/**
 * iOS [GalleryPicker] — stub implementation.
 *
 * Full implementation requires PHPickerViewController presentation from
 * the active UIViewController. This will be completed in the Upload
 * Service epic (Phase 8).
 */
actual class GalleryPicker {
    actual suspend fun pickImage(): ByteArray? {
        // TODO: Wire via PHPickerViewController in Upload epic
        return null
    }
}
