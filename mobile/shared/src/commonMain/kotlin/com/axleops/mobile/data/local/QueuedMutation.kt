package com.axleops.mobile.data.local

import kotlinx.datetime.Clock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Sealed class representing a queued offline mutation.
 *
 * Each variant carries the payload needed to replay the mutation
 * when connectivity returns. Mutations are processed in FIFO order.
 *
 * Source: spec FR-100–FR-104, plan §9
 */
@Serializable
sealed class QueuedMutation {
    abstract val mutationId: Long
    abstract val tripId: Long
    abstract val queuedAt: String
    abstract val status: MutationStatus

    abstract fun withId(id: Long): QueuedMutation
    abstract fun withStatus(newStatus: MutationStatus): QueuedMutation

    /**
     * Milestone transition queued offline.
     */
    @Serializable
    @SerialName("transition")
    data class QueuedTransition(
        override val mutationId: Long = 0,
        override val tripId: Long,
        val event: String,
        val capturedData: Map<String, String> = emptyMap(),
        val evidenceIds: List<String> = emptyList(),
        val latitude: Double? = null,
        val longitude: Double? = null,
        val gpsAccuracy: Double? = null,
        override val queuedAt: String = Clock.System.now().toString(),
        override val status: MutationStatus = MutationStatus.PENDING,
    ) : QueuedMutation() {
        override fun withId(id: Long) = copy(mutationId = id)
        override fun withStatus(newStatus: MutationStatus) = copy(status = newStatus)
    }

    /**
     * Expense creation queued offline.
     */
    @Serializable
    @SerialName("expense")
    data class QueuedExpense(
        override val mutationId: Long = 0,
        override val tripId: Long,
        val category: String,
        val amount: Double,
        val description: String? = null,
        val fuelLitres: Double? = null,
        val pricePerLitre: Double? = null,
        val odometerReading: Double? = null,
        override val queuedAt: String = Clock.System.now().toString(),
        override val status: MutationStatus = MutationStatus.PENDING,
    ) : QueuedMutation() {
        override fun withId(id: Long) = copy(mutationId = id)
        override fun withStatus(newStatus: MutationStatus) = copy(status = newStatus)
    }

    /**
     * Document upload queued offline.
     */
    @Serializable
    @SerialName("document")
    data class QueuedDocument(
        override val mutationId: Long = 0,
        override val tripId: Long,
        val category: String,
        val filename: String,
        val mimeType: String = "image/jpeg",
        val localFilePath: String,
        override val queuedAt: String = Clock.System.now().toString(),
        override val status: MutationStatus = MutationStatus.PENDING,
    ) : QueuedMutation() {
        override fun withId(id: Long) = copy(mutationId = id)
        override fun withStatus(newStatus: MutationStatus) = copy(status = newStatus)
    }

    /**
     * Exception report queued offline.
     */
    @Serializable
    @SerialName("exception")
    data class QueuedException(
        override val mutationId: Long = 0,
        override val tripId: Long,
        val exceptionType: String,
        val description: String,
        val latitude: Double? = null,
        val longitude: Double? = null,
        val evidenceIds: List<String> = emptyList(),
        override val queuedAt: String = Clock.System.now().toString(),
        override val status: MutationStatus = MutationStatus.PENDING,
    ) : QueuedMutation() {
        override fun withId(id: Long) = copy(mutationId = id)
        override fun withStatus(newStatus: MutationStatus) = copy(status = newStatus)
    }

    /**
     * Checkpoint event queued offline.
     */
    @Serializable
    @SerialName("checkpoint")
    data class QueuedCheckpoint(
        override val mutationId: Long = 0,
        override val tripId: Long,
        val eventType: String,
        val notes: String = "",
        val latitude: Double? = null,
        val longitude: Double? = null,
        override val queuedAt: String = Clock.System.now().toString(),
        override val status: MutationStatus = MutationStatus.PENDING,
    ) : QueuedMutation() {
        override fun withId(id: Long) = copy(mutationId = id)
        override fun withStatus(newStatus: MutationStatus) = copy(status = newStatus)
    }
}
