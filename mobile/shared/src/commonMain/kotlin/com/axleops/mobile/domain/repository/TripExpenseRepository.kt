package com.axleops.mobile.domain.repository

import com.axleops.mobile.domain.model.ExpenseCategory
import com.axleops.mobile.domain.model.TripExpense

/**
 * Repository interface for trip expense management.
 *
 * Source: spec FR-070–FR-077
 */
interface TripExpenseRepository {

    suspend fun getExpenses(tripId: Long): List<TripExpense>

    suspend fun createExpense(
        tripId: Long,
        category: ExpenseCategory,
        amount: Double,
        description: String? = null,
        receiptFileId: String? = null,
        fuelLitres: Double? = null,
        pricePerLitre: Double? = null,
        odometerReading: Double? = null,
    ): TripExpense

    suspend fun updateExpense(expense: TripExpense): TripExpense

    suspend fun deleteExpense(tripId: Long, expenseId: Long)
}
