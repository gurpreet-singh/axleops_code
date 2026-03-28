package com.axleops.mobile.upload

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.uuid.ExperimentalUuidApi
import kotlin.uuid.Uuid

/**
 * ViewModel orchestrating the upload flow: capture → preview → upload → result.
 *
 * State machine progression:
 * 1. [startCapture] → Capturing
 * 2. [onImageCaptured] → Previewing (with accept/retake/cancel)
 * 3. [acceptAndUpload] → Uploading → Success or Failed
 * 4. [retry] → Uploading (from Failed)
 * 5. [cancel] → Idle (from any state)
 *
 * @param uploadService The upload service (mock or real, injected via Koin).
 */
class UploadViewModel(
    private val uploadService: UploadService,
) : ViewModel() {

    private val _state = MutableStateFlow<UploadState>(UploadState.Idle)
    /** Current upload state — observed by UI. */
    val state: StateFlow<UploadState> = _state.asStateFlow()

    /**
     * Start a capture session.
     * UI should react by launching the camera or gallery picker.
     */
    fun startCapture(source: CaptureSource) {
        _state.value = UploadState.Capturing(source)
    }

    /**
     * Called when the platform camera/gallery returns image bytes.
     * Transitions to Previewing state where user can accept, retake, or cancel.
     *
     * @param imageBytes The captured/picked raw image data.
     * @param source How the image was captured.
     */
    fun onImageCaptured(imageBytes: ByteArray, source: CaptureSource) {
        if (imageBytes.isEmpty()) {
            // User cancelled the camera/gallery — return to idle
            _state.value = UploadState.Idle
            return
        }

        // Validate before showing preview
        val validationError = uploadService.validate(imageBytes)
        if (validationError != null) {
            _state.value = UploadState.Failed(
                job = createJob(imageBytes),
                errorMessage = validationError,
            )
            return
        }

        _state.value = UploadState.Previewing(
            imageBytes = imageBytes,
            source = source,
        )
    }

    /**
     * User accepted the preview — start uploading.
     *
     * @param fileType The upload category (default "POD").
     * @param tripId Optional trip to associate the file with.
     */
    fun acceptAndUpload(fileType: String = "POD", tripId: Long? = null) {
        val currentState = _state.value
        val imageBytes = when (currentState) {
            is UploadState.Previewing -> currentState.imageBytes
            else -> return // Invalid state for accept
        }

        val job = createJob(imageBytes, fileType, tripId)
        _state.value = UploadState.Uploading(job = job)

        viewModelScope.launch {
            executeUpload(job)
        }
    }

    /**
     * Retry a failed upload.
     */
    fun retry() {
        val currentState = _state.value
        if (currentState !is UploadState.Failed) return

        val retryCount = currentState.retryCount + 1
        _state.value = UploadState.Uploading(job = currentState.job)

        viewModelScope.launch {
            try {
                val result = uploadService.retry(
                    job = currentState.job,
                    onProgress = { progress ->
                        _state.update { state ->
                            if (state is UploadState.Uploading) {
                                state.copy(progressPercent = progress)
                            } else state
                        }
                    },
                )
                _state.value = UploadState.Success(job = result)
            } catch (e: Exception) {
                _state.value = UploadState.Failed(
                    job = currentState.job,
                    errorMessage = e.message ?: "Upload failed",
                    retryCount = retryCount,
                )
            }
        }
    }

    /**
     * Cancel the current upload flow and return to Idle.
     */
    fun cancel() {
        _state.value = UploadState.Idle
    }

    /**
     * Reset to Idle after handling a Success state.
     */
    fun dismiss() {
        _state.value = UploadState.Idle
    }

    // ── Private ─────────────────────────────────────────────────────────

    private suspend fun executeUpload(job: UploadJob) {
        try {
            val result = uploadService.upload(
                imageBytes = job.imageBytes,
                fileType = job.fileType,
                tripId = job.associatedTripId,
                onProgress = { progress ->
                    _state.update { state ->
                        if (state is UploadState.Uploading) {
                            state.copy(progressPercent = progress)
                        } else state
                    }
                },
            )
            _state.value = UploadState.Success(job = result)
        } catch (e: Exception) {
            _state.value = UploadState.Failed(
                job = job,
                errorMessage = e.message ?: "Upload failed",
            )
        }
    }

    @OptIn(ExperimentalUuidApi::class)
    private fun createJob(
        imageBytes: ByteArray,
        fileType: String = "POD",
        tripId: Long? = null,
    ): UploadJob = UploadJob(
        id = Uuid.random().toString(),
        imageBytes = imageBytes,
        fileType = fileType,
        associatedTripId = tripId,
    )
}
