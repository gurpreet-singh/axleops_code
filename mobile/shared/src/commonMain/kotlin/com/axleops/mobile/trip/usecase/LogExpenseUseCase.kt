package com.axleops.mobile.trip.usecase

import com.axleops.mobile.domain.model.ExpenseCategory
import com.axleops.mobile.domain.model.TripExpense
import com.axleops.mobile.domain.repository.TripExpenseRepository

/**
 * Use case for logging, editing, and deleting trip expenses.
 *
 * Future: Queues to OfflineQueue if network unavailable.
 *
 * Source: spec FR-070–FR-077
 */
class LogExpenseUseCase(
    private val expenseRepository: TripExpenseRepository,
) {
    suspend fun create(
        tripId: Long,
        category: ExpenseCategory,
        amount: Double,
        description: String? = null,
        receiptFileId: String? = null,
        fuelLitres: Double? = null,
        pricePerLitre: Double? = null,
        odometerReading: Double? = null,
    ): TripExpense = expenseRepository.createExpense(
        tripId = tripId,
        category = category,
        amount = amount,
        description = description,
        receiptFileId = receiptFileId,
        fuelLitres = fuelLitres,
        pricePerLitre = pricePerLitre,
        odometerReading = odometerReading,
    )

    suspend fun update(expense: TripExpense): TripExpense =
        expenseRepository.updateExpense(expense)

    suspend fun delete(tripId: Long, expenseId: Long) =
        expenseRepository.deleteExpense(tripId, expenseId)

    suspend fun getAll(tripId: Long): List<TripExpense> =
        expenseRepository.getExpenses(tripId)
}
