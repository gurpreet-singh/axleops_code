package com.axleops.mobile.trip.component

import com.arkivanov.decompose.ComponentContext
import com.axleops.mobile.domain.model.ExpenseCategory
import com.axleops.mobile.trip.usecase.LogExpenseUseCase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Decompose component for add/edit expense form.
 *
 * Source: spec FR-070–FR-077, plan §7
 */
class ExpenseFormComponent(
    componentContext: ComponentContext,
    private val tripId: Long,
    private val logExpense: LogExpenseUseCase,
    private val onComplete: () -> Unit,
) : ComponentContext by componentContext {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

    private val _uiState = MutableStateFlow(ExpenseFormUiState())
    val uiState: StateFlow<ExpenseFormUiState> = _uiState.asStateFlow()

    fun setCategory(category: ExpenseCategory) {
        _uiState.value = _uiState.value.copy(category = category)
    }

    fun setAmount(amount: String) {
        _uiState.value = _uiState.value.copy(amountText = amount)
    }

    fun setDescription(description: String) {
        _uiState.value = _uiState.value.copy(description = description)
    }

    fun setFuelLitres(litres: String) {
        _uiState.value = _uiState.value.copy(fuelLitresText = litres)
    }

    fun setPricePerLitre(price: String) {
        _uiState.value = _uiState.value.copy(pricePerLitreText = price)
    }

    fun setOdometerReading(reading: String) {
        _uiState.value = _uiState.value.copy(odometerText = reading)
    }

    fun submit() {
        val current = _uiState.value
        val amount = current.amountText.toDoubleOrNull() ?: return
        _uiState.value = current.copy(isSubmitting = true, error = null)

        scope.launch {
            try {
                logExpense.create(
                    tripId = tripId,
                    category = current.category,
                    amount = amount,
                    description = current.description.ifBlank { null },
                    fuelLitres = current.fuelLitresText.toDoubleOrNull(),
                    pricePerLitre = current.pricePerLitreText.toDoubleOrNull(),
                    odometerReading = current.odometerText.toDoubleOrNull(),
                )
                _uiState.value = current.copy(isSubmitting = false, isComplete = true)
                onComplete()
            } catch (e: Exception) {
                _uiState.value = current.copy(
                    isSubmitting = false,
                    error = e.message ?: "Failed to log expense",
                )
            }
        }
    }

    fun dismissError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class ExpenseFormUiState(
    val category: ExpenseCategory = ExpenseCategory.FUEL,
    val amountText: String = "",
    val description: String = "",
    val fuelLitresText: String = "",
    val pricePerLitreText: String = "",
    val odometerText: String = "",
    val isSubmitting: Boolean = false,
    val isComplete: Boolean = false,
    val error: String? = null,
) {
    val isFuel: Boolean get() = category == ExpenseCategory.FUEL
    val canSubmit: Boolean get() = amountText.toDoubleOrNull() != null && amountText.toDouble() > 0
}
