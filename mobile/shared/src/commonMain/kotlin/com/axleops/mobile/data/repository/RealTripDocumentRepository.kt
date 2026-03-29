package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.DocumentCategory
import com.axleops.mobile.domain.model.TripDocument
import com.axleops.mobile.domain.repository.TripDocumentRepository
import io.ktor.client.HttpClient

/**
 * Real [TripDocumentRepository] — backend-backed.
 *
 * Backend gap G4: File upload API does not exist yet.
 * When backend adds multipart `POST /trips/{id}/documents`,
 * this implementation will handle the upload.
 */
class RealTripDocumentRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : TripDocumentRepository {

    override suspend fun getDocuments(tripId: Long): List<TripDocument> {
        // Backend gap G4: No document listing endpoint yet
        return emptyList()
    }

    override suspend fun uploadDocument(
        tripId: Long,
        bytes: ByteArray,
        category: DocumentCategory,
        filename: String,
        mimeType: String,
    ): TripDocument {
        // Backend gap G4: No file upload API yet
        throw UnsupportedOperationException("Backend document upload API not available (gap G4)")
    }

    override suspend fun deleteDocument(tripId: Long, documentId: Long) {
        // Backend gap G4: No document delete endpoint yet
        throw UnsupportedOperationException("Backend document delete API not available (gap G4)")
    }
}
