package com.axleops.mobile.platform

/**
 * Gallery image picker abstraction.
 *
 * Provides a suspend function to invoke the platform gallery/photo picker
 * and return the selected image as raw bytes.
 *
 * Platform implementations:
 * - Android: [ActivityResultContracts.GetContent] with MIME type `image`
 * - iOS: [PHPickerViewController]
 *
 * Foundation-owned but consumed only by the Upload Service.
 */
expect class GalleryPicker {

    /**
     * Launch the platform gallery picker and select an image.
     *
     * @return The selected image as a byte array, or null if the user cancelled.
     */
    suspend fun pickImage(): ByteArray?
}
