package com.axleops.mobile.data.repository

import com.axleops.mobile.domain.model.ExpenseCategory
import com.axleops.mobile.domain.model.TripExpense
import com.axleops.mobile.domain.repository.TripExpenseRepository
import io.ktor.client.HttpClient

/**
 * Real [TripExpenseRepository] — backend-backed.
 *
 * Backend gap G5: Trip expense API does not exist yet.
 */
class RealTripExpenseRepository(
    private val httpClient: HttpClient,
    private val baseUrl: String,
) : TripExpenseRepository {

    override suspend fun getExpenses(tripId: Long): List<TripExpense> = emptyList()

    override suspend fun createExpense(
        tripId: Long, category: ExpenseCategory, amount: Double,
        description: String?, receiptFileId: String?,
        fuelLitres: Double?, pricePerLitre: Double?, odometerReading: Double?,
    ): TripExpense = throw UnsupportedOperationException("Backend expense API not available (gap G5)")

    override suspend fun updateExpense(expense: TripExpense): TripExpense =
        throw UnsupportedOperationException("Backend expense API not available (gap G5)")

    override suspend fun deleteExpense(tripId: Long, expenseId: Long) =
        throw UnsupportedOperationException("Backend expense API not available (gap G5)")
}
