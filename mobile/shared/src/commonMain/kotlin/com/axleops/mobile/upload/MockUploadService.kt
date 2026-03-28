package com.axleops.mobile.upload

import kotlinx.coroutines.delay
import kotlin.time.Clock
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * Mock [UploadService] for offline QA testing.
 *
 * Simulates the upload flow with a 1500ms delay and mock progress callbacks.
 * Returns a mock URL and file ID — no actual network call.
 *
 * Used when [DataSourceConfig.uploadSource] == [DataSourceMode.MOCK].
 */
class MockUploadService : UploadService {

    companion object {
        private const val SIMULATED_UPLOAD_DURATION_MS = 1500L
        private const val PROGRESS_STEPS = 10
    }

    @OptIn(ExperimentalUuidApi::class)
    override suspend fun upload(
        imageBytes: ByteArray,
        fileType: String,
        tripId: Long?,
        onProgress: (Float) -> Unit,
    ): UploadJob {
        val jobId = Uuid.random().toString()
        val stepDelay = SIMULATED_UPLOAD_DURATION_MS / PROGRESS_STEPS

        // Simulate progress increments
        for (step in 1..PROGRESS_STEPS) {
            delay(stepDelay)
            onProgress(step.toFloat() / PROGRESS_STEPS)
        }

        return UploadJob(
            id = jobId,
            imageBytes = imageBytes,
            fileType = fileType,
            associatedTripId = tripId,
            createdAtMs = Clock.System.now().toEpochMilliseconds(),
            resultUrl = "https://storage.axleops-mock.com/uploads/mock-$jobId.jpg",
            resultFileId = (1000L..9999L).random(),
        )
    }

    override suspend fun retry(
        job: UploadJob,
        onProgress: (Float) -> Unit,
    ): UploadJob = upload(
        imageBytes = job.imageBytes,
        fileType = job.fileType,
        tripId = job.associatedTripId,
        onProgress = onProgress,
    )
}
