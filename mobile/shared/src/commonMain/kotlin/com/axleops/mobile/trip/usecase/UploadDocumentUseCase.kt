package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.DocumentCategory
import com.axleops.mobile.domain.model.TripDocument
import com.axleops.mobile.domain.repository.TripDocumentRepository

/**
 * Use case for uploading a trip document.
 *
 * Handles category selection → file bytes → upload → return.
 * Future: queues to OfflineQueue if network unavailable.
 *
 * Source: spec FR-060–FR-066
 */
class UploadDocumentUseCase(
    private val documentRepository: TripDocumentRepository,
) {
    suspend operator fun invoke(
        tripId: Long,
        bytes: ByteArray,
        category: DocumentCategory,
        filename: String,
        mimeType: String = "image/jpeg",
    ): TripDocument {
        return documentRepository.uploadDocument(
            tripId = tripId,
            bytes = bytes,
            category = category,
            filename = filename,
            mimeType = mimeType,
        )
    }
}
