package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.ExpenseCategory
import com.axleops.mobile.domain.model.SyncStatus
import com.axleops.mobile.domain.model.TripExpense
import com.axleops.mobile.domain.repository.TripExpenseRepository
import kotlinx.datetime.Clock

/**
 * Mock [TripExpenseRepository] — in-memory list with edit and soft-delete.
 */
class MockTripExpenseRepository : TripExpenseRepository {

    private val expenses = mutableListOf<TripExpense>()
    private var nextId = 1L

    override suspend fun getExpenses(tripId: Long): List<TripExpense> =
        expenses.filter { it.tripId == tripId && !it.isDeleted }

    override suspend fun createExpense(
        tripId: Long,
        category: ExpenseCategory,
        amount: Double,
        description: String?,
        receiptFileId: String?,
        fuelLitres: Double?,
        pricePerLitre: Double?,
        odometerReading: Double?,
    ): TripExpense {
        val expense = TripExpense(
            id = nextId++,
            tripId = tripId,
            category = category,
            amount = amount,
            description = description,
            loggedAt = Clock.System.now().toString(),
            receiptFileId = receiptFileId,
            fuelLitres = fuelLitres,
            pricePerLitre = pricePerLitre,
            odometerReading = odometerReading,
            syncStatus = SyncStatus.SYNCED,
        )
        expenses.add(expense)
        return expense
    }

    override suspend fun updateExpense(expense: TripExpense): TripExpense {
        val index = expenses.indexOfFirst { it.id == expense.id }
        if (index >= 0) {
            val updated = expense.copy(lastEditedAt = Clock.System.now().toString())
            expenses[index] = updated
            return updated
        }
        throw IllegalArgumentException("Expense ${expense.id} not found")
    }

    override suspend fun deleteExpense(tripId: Long, expenseId: Long) {
        val index = expenses.indexOfFirst { it.id == expenseId && it.tripId == tripId }
        if (index >= 0) {
            expenses[index] = expenses[index].copy(isDeleted = true)
        }
    }
}
