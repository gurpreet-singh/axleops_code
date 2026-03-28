package com.axleops.mobile.platform

/**
 * Android [GalleryPicker] — stub implementation.
 *
 * Full implementation requires Activity Result API integration. Will be
 * completed in the Upload Service epic (Phase 8, T039–T045).
 *
 * For now, returns null (simulating user cancellation) to satisfy the
 * expect/actual contract and enable compilation.
 */
actual class GalleryPicker {
    actual suspend fun pickImage(): ByteArray? {
        // TODO: Wire via Activity Result API in Upload epic
        // ActivityResultContracts.GetContent("image/*") → read bytes from URI
        return null
    }
}
