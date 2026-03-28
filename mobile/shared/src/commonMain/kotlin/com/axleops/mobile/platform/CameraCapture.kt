package com.axleops.mobile.platform

/**
 * Camera capture abstraction.
 *
 * Provides a suspend function to invoke the platform camera and return
 * the captured image as raw bytes.
 *
 * Platform implementations:
 * - Android: [ActivityResultContracts.TakePicture] via Activity Result API
 * - iOS: [UIImagePickerController] with camera source
 *
 * Foundation-owned but consumed only by the Upload Service.
 */
expect class CameraCapture {

    /**
     * Launch the platform camera and capture a photo.
     *
     * @return The captured image as a byte array, or null if the user cancelled.
     */
    suspend fun capturePhoto(): ByteArray?
}
