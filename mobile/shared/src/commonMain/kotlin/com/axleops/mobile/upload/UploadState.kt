package com.axleops.mobile.upload

import kotlin.time.Clock

/**
 * Upload state machine for camera/gallery → preview → upload flows.
 *
 * Transitions:
 * ```
 * Idle → Capturing → Previewing → Uploading → Success
 *                  ↘               ↗             ↘
 *                   Idle (cancel)  Failed → retry → Uploading
 * ```
 */
sealed interface UploadState {

    /** No upload in progress. Initial state. */
    data object Idle : UploadState

    /** Camera or gallery is active, awaiting user to capture/pick. */
    data class Capturing(val source: CaptureSource) : UploadState

    /** Photo captured — showing preview with accept/retake/cancel options. */
    data class Previewing(val imageBytes: ByteArray, val source: CaptureSource) : UploadState {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (other !is Previewing) return false
            return imageBytes.contentEquals(other.imageBytes) && source == other.source
        }
        override fun hashCode(): Int = imageBytes.contentHashCode() * 31 + source.hashCode()
    }

    /** Upload in progress — shows progress indicator. */
    data class Uploading(
        val job: UploadJob,
        val progressPercent: Float = 0f,
    ) : UploadState

    /** Upload completed successfully. */
    data class Success(val job: UploadJob) : UploadState

    /** Upload failed — user can retry or cancel. */
    data class Failed(
        val job: UploadJob,
        val errorMessage: String,
        val retryCount: Int = 0,
    ) : UploadState
}

/**
 * Source of the captured image.
 */
enum class CaptureSource {
    CAMERA,
    GALLERY,
}

/**
 * Domain model representing an upload job.
 *
 * Tracks the full lifecycle from capture to server confirmation.
 *
 * @property id Unique client-side ID for this upload (UUID).
 * @property imageBytes The raw image data to upload.
 * @property fileType The purpose of this upload (e.g., "POD", "VEHICLE_PHOTO").
 * @property associatedTripId Optional trip ID to associate the file with.
 * @property createdAt When the upload was initiated.
 * @property resultUrl The server-returned URL after successful upload (null until success).
 * @property resultFileId The server-returned file ID after successful upload (null until success).
 */
data class UploadJob(
    val id: String,
    val imageBytes: ByteArray,
    val fileType: String = "POD",
    val associatedTripId: Long? = null,
    val createdAtMs: Long = Clock.System.now().toEpochMilliseconds(),
    val resultUrl: String? = null,
    val resultFileId: Long? = null,
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is UploadJob) return false
        return id == other.id
    }
    override fun hashCode(): Int = id.hashCode()
}
