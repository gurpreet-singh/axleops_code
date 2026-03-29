package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.DocumentCategory
import com.axleops.mobile.domain.model.SyncStatus
import com.axleops.mobile.domain.model.TripDocument
import com.axleops.mobile.domain.model.UploadStatus
import com.axleops.mobile.domain.repository.TripDocumentRepository
import kotlinx.datetime.Clock

/**
 * Mock [TripDocumentRepository] backed by in-memory list.
 *
 * Simulates upload delay and auto-generates IDs.
 */
class MockTripDocumentRepository : TripDocumentRepository {

    private val documents = mutableListOf<TripDocument>()
    private var nextId = 1L

    override suspend fun getDocuments(tripId: Long): List<TripDocument> =
        documents.filter { it.tripId == tripId && !it.isDeleted }

    override suspend fun uploadDocument(
        tripId: Long,
        bytes: ByteArray,
        category: DocumentCategory,
        filename: String,
        mimeType: String,
    ): TripDocument {
        val doc = TripDocument(
            id = nextId++,
            tripId = tripId,
            category = category,
            filename = filename,
            mimeType = mimeType,
            fileSizeBytes = bytes.size.toLong(),
            uploadedAt = Clock.System.now().toString(),
            uploadStatus = UploadStatus.UPLOADED,
            syncStatus = SyncStatus.SYNCED,
            fileUrl = "mock://documents/$tripId/${nextId - 1}",
        )
        documents.add(doc)
        return doc
    }

    override suspend fun deleteDocument(tripId: Long, documentId: Long) {
        val index = documents.indexOfFirst { it.id == documentId && it.tripId == tripId }
        if (index >= 0) {
            documents[index] = documents[index].copy(isDeleted = true)
        }
    }
}
