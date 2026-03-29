package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.DocumentCategory
import com.axleops.mobile.domain.model.TripDocument

/**
 * Repository interface for trip document management.
 *
 * Handles document upload, retrieval, and deletion.
 *
 * Backend gap G4: File upload API does not exist yet.
 *
 * Source: spec FR-060–FR-066
 */
interface TripDocumentRepository {

    /** Fetch all documents for a trip. */
    suspend fun getDocuments(tripId: Long): List<TripDocument>

    /** Upload a document (photo or file). Returns the created document. */
    suspend fun uploadDocument(
        tripId: Long,
        bytes: ByteArray,
        category: DocumentCategory,
        filename: String,
        mimeType: String = "image/jpeg",
    ): TripDocument

    /** Soft-delete a document. */
    suspend fun deleteDocument(tripId: Long, documentId: Long)
}
