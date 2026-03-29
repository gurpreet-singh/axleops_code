package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.ExceptionType
import com.axleops.mobile.domain.model.TripException
import com.axleops.mobile.trip.usecase.ReportExceptionUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Decompose component for exception reporting.
 *
 * Source: spec FR-080–FR-084, plan §8
 */
class ExceptionReportComponent(
    componentContext: ComponentContext,
    private val tripId: Long,
    private val reportException: ReportExceptionUseCase,
    private val onComplete: () -> Unit,
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow(ExceptionReportUiState())
    val uiState: StateFlow<ExceptionReportUiState> = _uiState.asStateFlow()

    fun setType(type: ExceptionType) {
        _uiState.value = _uiState.value.copy(selectedType = type)
    }

    fun setDescription(description: String) {
        _uiState.value = _uiState.value.copy(description = description)
    }

    fun addEvidenceId(id: String) {
        val current = _uiState.value
        _uiState.value = current.copy(evidenceIds = current.evidenceIds + id)
    }

    fun submit() {
        val current = _uiState.value
        _uiState.value = current.copy(isSubmitting = true, error = null)

        scope.launch {
            try {
                val exception = TripException(
                    tripId = tripId,
                    type = current.selectedType,
                    description = current.description,
                    reportedAt = kotlinx.datetime.Clock.System.now().toString(),
                    evidenceIds = current.evidenceIds,
                )
                reportException(tripId, exception)
                _uiState.value = current.copy(isSubmitting = false, isComplete = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = current.copy(
                    isSubmitting = false,
                    error = e.message ?: "Failed to report exception",
                )
            }
        }
    }

    fun dismissError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class ExceptionReportUiState(
    val selectedType: ExceptionType = ExceptionType.VEHICLE_BREAKDOWN,
    val description: String = "",
    val evidenceIds: List<String> = emptyList(),
    val isSubmitting: Boolean = false,
    val isComplete: Boolean = false,
    val error: String? = null,
) {
    val canSubmit: Boolean get() = description.isNotBlank()
}
