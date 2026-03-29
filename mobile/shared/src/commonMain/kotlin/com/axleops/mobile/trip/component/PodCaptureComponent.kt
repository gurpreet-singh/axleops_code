package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.Pod
import com.axleops.mobile.domain.model.PodVerificationStatus
import com.axleops.mobile.trip.usecase.SubmitPodUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.datetime.Clock

/**
 * Decompose component for the multi-step POD capture flow.
 *
 * Steps:
 * 1. Photo capture (minimum 2 delivery photos)
 * 2. Signature capture (digital signature pad)
 * 3. Consignee details (name + phone)
 * 4. Review + submit
 *
 * Pure Kotlin -- no Compose imports.
 *
 * Source: spec FR-090–FR-097, plan §6.2
 */
class PodCaptureComponent(
    componentContext: ComponentContext,
    private val tripId: Long,
    private val submitPod: SubmitPodUseCase,
    private val onComplete: () -> Unit,
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow(PodCaptureUiState())
    val uiState: StateFlow<PodCaptureUiState> = _uiState.asStateFlow()

    // ── Step Navigation ──────────────────────────────────────────────────

    fun nextStep() {
        val current = _uiState.value
        if (current.currentStep < PodStep.entries.lastIndex) {
            _uiState.value = current.copy(currentStep = current.currentStep + 1)
        }
    }

    fun previousStep() {
        val current = _uiState.value
        if (current.currentStep > 0) {
            _uiState.value = current.copy(currentStep = current.currentStep - 1)
        }
    }

    // ── Data Capture ─────────────────────────────────────────────────────

    fun addPhoto(photoId: String) {
        val current = _uiState.value
        _uiState.value = current.copy(photoIds = current.photoIds + photoId)
    }

    fun removePhoto(photoId: String) {
        val current = _uiState.value
        _uiState.value = current.copy(photoIds = current.photoIds - photoId)
    }

    fun setSignatureId(signatureId: String) {
        _uiState.value = _uiState.value.copy(signatureId = signatureId)
    }

    fun setConsigneeName(name: String) {
        _uiState.value = _uiState.value.copy(consigneeName = name)
    }

    fun setConsigneePhone(phone: String) {
        _uiState.value = _uiState.value.copy(consigneePhone = phone)
    }

    fun setRemarks(remarks: String) {
        _uiState.value = _uiState.value.copy(remarks = remarks)
    }

    // ── Submit ───────────────────────────────────────────────────────────

    fun submit() {
        val current = _uiState.value
        _uiState.value = current.copy(isSubmitting = true, error = null)

        scope.launch {
            try {
                val pod = Pod(
                    tripId = tripId,
                    consigneeName = current.consigneeName,
                    photoIds = current.photoIds,
                    signatureId = current.signatureId,
                    remarks = current.remarks.ifBlank { null },
                    submittedAt = Clock.System.now().toString(),
                    verificationStatus = PodVerificationStatus.SUBMITTED,
                )
                submitPod(tripId, pod)
                _uiState.value = current.copy(isSubmitting = false, isComplete = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = current.copy(
                    isSubmitting = false,
                    error = e.message ?: "POD submission failed",
                )
            }
        }
    }

    fun dismissError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

/**
 * POD capture steps.
 */
enum class PodStep(val label: String) {
    PHOTOS("Delivery Photos"),
    SIGNATURE("Signature"),
    CONSIGNEE("Consignee Details"),
    REVIEW("Review & Submit"),
}

/**
 * UI state for the POD capture flow.
 */
data class PodCaptureUiState(
    val currentStep: Int = 0,
    val photoIds: List<String> = emptyList(),
    val signatureId: String? = null,
    val consigneeName: String = "",
    val consigneePhone: String = "",
    val remarks: String = "",
    val isSubmitting: Boolean = false,
    val isComplete: Boolean = false,
    val error: String? = null,
) {
    val currentStepEnum: PodStep
        get() = PodStep.entries[currentStep.coerceIn(PodStep.entries.indices)]

    val canProceedFromPhotos: Boolean
        get() = photoIds.size >= 2

    val canProceedFromSignature: Boolean
        get() = signatureId != null

    val canProceedFromConsignee: Boolean
        get() = consigneeName.isNotBlank() && consigneePhone.isNotBlank()

    val canSubmit: Boolean
        get() = canProceedFromPhotos && canProceedFromSignature && canProceedFromConsignee
}
