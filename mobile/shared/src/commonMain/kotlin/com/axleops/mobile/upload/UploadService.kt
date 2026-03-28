package com.axleops.mobile.upload

/**
 * Upload service interface.
 *
 * Abstracts the upload lifecycle: capture → preview → upload → result.
 * Implementations:
 * - [MockUploadService] — simulated upload with 1500ms delay
 * - [RealUploadService] — Ktor multipart POST to backend
 *
 * Platform camera/gallery integration is handled via [CameraCapture] and
 * [GalleryPicker] expect/actual classes. This service orchestrates the
 * upload portion of the flow.
 */
interface UploadService {

    /**
     * Upload image bytes to the backend (or mock storage).
     *
     * @param imageBytes Raw image data.
     * @param fileType The file type category (e.g., "POD", "VEHICLE_PHOTO").
     * @param tripId Optional trip ID to associate the upload with.
     * @param onProgress Callback with upload progress (0.0 to 1.0).
     * @return The completed [UploadJob] with server-assigned URL and file ID.
     * @throws Exception on network or server errors (mapped via [ApiError]).
     */
    suspend fun upload(
        imageBytes: ByteArray,
        fileType: String = "POD",
        tripId: Long? = null,
        onProgress: (Float) -> Unit = {},
    ): UploadJob

    /**
     * Retry a previously failed upload.
     *
     * @param job The failed upload job to retry.
     * @param onProgress Callback with upload progress (0.0 to 1.0).
     * @return The completed [UploadJob] with server-assigned URL and file ID.
     */
    suspend fun retry(
        job: UploadJob,
        onProgress: (Float) -> Unit = {},
    ): UploadJob

    /**
     * Validate image bytes before upload.
     *
     * Checks file size limits and basic format validation.
     *
     * @param imageBytes Raw image data.
     * @return null if valid, or an error message string if invalid.
     */
    fun validate(imageBytes: ByteArray): String? {
        val maxSizeBytes = 10 * 1024 * 1024 // 10 MB
        if (imageBytes.size > maxSizeBytes) {
            val sizeMb = imageBytes.size / (1024 * 1024)
            return "File too large ($sizeMb MB). Maximum is 10 MB."
        }
        if (imageBytes.isEmpty()) {
            return "No image data to upload."
        }
        return null
    }
}
