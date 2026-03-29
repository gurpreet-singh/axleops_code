package com.axleops.mobile.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Document categories available to the driver.
 *
 * Source: spec Story 7, acceptance scenario 2
 */
@Serializable
enum class DocumentCategory(val displayLabel: String) {
    @SerialName("INVOICE") INVOICE("Invoice"),
    @SerialName("WEIGHBRIDGE_SLIP") WEIGHBRIDGE_SLIP("Weighbridge Slip"),
    @SerialName("PERMIT") PERMIT("Permit"),
    @SerialName("CARGO_PHOTO") CARGO_PHOTO("Cargo Photo"),
    @SerialName("INSPECTION_REPORT") INSPECTION_REPORT("Inspection Report"),
    @SerialName("RECEIPT") RECEIPT("Receipt"),
    @SerialName("OTHER") OTHER("Other"),
}

/**
 * Upload lifecycle status for a file.
 */
@Serializable
enum class UploadStatus {
    /** Waiting to start (queued). */
    @SerialName("PENDING") PENDING,
    /** Upload in progress. */
    @SerialName("UPLOADING") UPLOADING,
    /** Successfully uploaded to server. */
    @SerialName("UPLOADED") UPLOADED,
    /** Upload failed, can be retried. */
    @SerialName("FAILED") FAILED,
}

/**
 * A document uploaded by the driver during a trip.
 *
 * Source: spec Story 7, FR-060 through FR-066
 *
 * Documents are evidence files (photos, PDFs). Editable/deletable until
 * POD_SUBMITTED (clarification Q4, soft-delete for audit).
 */
@Serializable
data class TripDocument(
    /** Server-assigned ID. 0 for locally-created, unsynced entries. */
    val id: Long = 0,

    /** Trip this document belongs to. */
    @SerialName("trip_id")
    val tripId: Long,

    /** Document category. */
    val category: DocumentCategory,

    /** Original filename or description. */
    val filename: String = "",

    /** Server-assigned file URL for viewing. Null before upload completes. */
    @SerialName("file_url")
    val fileUrl: String? = null,

    /** Thumbnail URL for list display. Null before upload or for PDFs. */
    @SerialName("thumbnail_url")
    val thumbnailUrl: String? = null,

    /** File ID from UploadService. */
    @SerialName("file_id")
    val fileId: String? = null,

    /** MIME type, e.g. "image/jpeg", "application/pdf". */
    @SerialName("mime_type")
    val mimeType: String = "image/jpeg",

    /** File size in bytes. */
    @SerialName("file_size_bytes")
    val fileSizeBytes: Long = 0,

    /** ISO-8601 timestamp when uploaded. */
    @SerialName("uploaded_at")
    val uploadedAt: String,

    /** Upload status. */
    @SerialName("upload_status")
    val uploadStatus: UploadStatus = UploadStatus.UPLOADED,

    /** Sync status for offline-queued uploads. */
    @SerialName("sync_status")
    val syncStatus: SyncStatus = SyncStatus.SYNCED,

    /** Whether this entry has been soft-deleted. */
    @SerialName("is_deleted")
    val isDeleted: Boolean = false,

    /** Who uploaded this document. */
    @SerialName("uploaded_by")
    val uploadedBy: Long? = null,
) {
    /** Whether this document is a photo (image MIME type). */
    val isImage: Boolean
        get() = mimeType.startsWith("image/")

    /** Whether this document is a PDF. */
    val isPdf: Boolean
        get() = mimeType == "application/pdf"
}
