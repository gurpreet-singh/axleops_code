package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.TripStatus
import com.axleops.mobile.trip.usecase.TransitionMilestoneUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Decompose component for the Milestone Action screen.
 *
 * Manages the context-sensitive form for a given milestone transition:
 * - LOADING → LoadingComplete form (weight, seal number, photos)
 * - UNLOADING → DeliveryComplete form (weight, condition)
 * - Other transitions → simple confirmation with GPS auto-capture
 *
 * Pure Kotlin -- no Compose imports. The Compose layer observes [uiState].
 *
 * Source: spec FR-020–FR-028, plan §4
 */
class MilestoneActionComponent(
    componentContext: ComponentContext,
    private val tripId: Long,
    private val event: String,
    private val currentStatus: TripStatus,
    private val transitionMilestone: TransitionMilestoneUseCase,
    private val onComplete: () -> Unit,
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow(
        MilestoneActionUiState(
            event = event,
            formType = resolveFormType(currentStatus),
        )
    )

    val uiState: StateFlow<MilestoneActionUiState> = _uiState.asStateFlow()

    /**
     * Submit the milestone transition with captured form data.
     */
    fun submit(
        capturedData: Map<String, String> = emptyMap(),
        evidenceIds: List<String> = emptyList(),
    ) {
        _uiState.value = _uiState.value.copy(isSubmitting = true, error = null)

        scope.launch {
            try {
                transitionMilestone(
                    tripId = tripId,
                    event = event,
                    capturedData = capturedData,
                    evidenceIds = evidenceIds,
                )
                _uiState.value = _uiState.value.copy(isSubmitting = false, isComplete = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    error = e.message ?: "Transition failed",
                )
            }
        }
    }

    /** Update a form field value. */
    fun updateField(key: String, value: String) {
        val current = _uiState.value.formData.toMutableMap()
        current[key] = value
        _uiState.value = _uiState.value.copy(formData = current)
    }

    /** Dismiss the error. */
    fun dismissError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    private fun resolveFormType(status: TripStatus): MilestoneFormType = when (status) {
        TripStatus.LOADING -> MilestoneFormType.LOADING_COMPLETE
        TripStatus.UNLOADING -> MilestoneFormType.DELIVERY_COMPLETE
        TripStatus.DELIVERED -> MilestoneFormType.SUBMIT_POD
        else -> MilestoneFormType.SIMPLE_CONFIRM
    }
}

/**
 * UI state for the Milestone Action screen.
 */
data class MilestoneActionUiState(
    val event: String,
    val formType: MilestoneFormType,
    val formData: Map<String, String> = emptyMap(),
    val isSubmitting: Boolean = false,
    val isComplete: Boolean = false,
    val error: String? = null,
)

/**
 * The type of form to render for a milestone transition.
 */
enum class MilestoneFormType {
    /** Simple confirmation — just GPS + timestamp auto-capture. */
    SIMPLE_CONFIRM,

    /** Loading complete form — weight, seal number, photos. */
    LOADING_COMPLETE,

    /** Delivery complete form — delivered weight, cargo condition. */
    DELIVERY_COMPLETE,

    /** POD submission — multi-step flow (photos, signature, consignee). */
    SUBMIT_POD,
}
