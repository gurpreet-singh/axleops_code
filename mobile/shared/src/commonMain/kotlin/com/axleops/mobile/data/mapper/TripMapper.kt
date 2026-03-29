package com.axleops.mobile.data.mapper

import com.axleops.mobile.data.dto.MilestoneDto
import com.axleops.mobile.data.dto.TripDetailDto
import com.axleops.mobile.domain.model.Milestone
import com.axleops.mobile.domain.model.MilestoneStatus
import com.axleops.mobile.domain.model.MilestoneType
import com.axleops.mobile.domain.model.TripDetail
import com.axleops.mobile.domain.model.TripStatus

/**
 * Maps API DTOs to domain models.
 *
 * All mapping functions handle unknown/unmapped values gracefully
 * by falling back to safe defaults (e.g., [TripStatus.UNKNOWN]).
 */
object TripMapper {

    /**
     * Map a [TripDetailDto] to the domain [TripDetail].
     *
     * Handles:
     * - Unknown status strings -> TripStatus.UNKNOWN
     * - Missing milestones -> empty list
     * - Null fields -> preserved as null
     */
    fun toDomain(dto: TripDetailDto): TripDetail = TripDetail(
        id = dto.id,
        tripNumber = dto.tripNumber,
        status = TripStatus.fromString(dto.status),
        originCity = dto.originCity,
        destinationCity = dto.destinationCity,
        originAddress = dto.originAddress,
        destinationAddress = dto.destinationAddress,
        originLat = dto.originLat,
        originLng = dto.originLng,
        destinationLat = dto.destinationLat,
        destinationLng = dto.destinationLng,
        startDate = dto.startDate,
        endDate = dto.endDate,
        expectedDeliveryDate = dto.expectedDeliveryDate,
        driverId = dto.driverId,
        driverName = dto.driverName,
        vehicleId = dto.vehicleId,
        vehicleNumber = dto.vehicleNumber,
        branchId = dto.branchId,
        customerName = dto.customerName,
        cargoDescription = dto.cargoDescription,
        bookedWeightMt = dto.bookedWeightMt,
        actualWeightMt = dto.actualWeightMt,
        deliveredWeightMt = dto.deliveredWeightMt,
        consignmentValue = dto.consignmentValue,
        lrNumber = dto.lrNumber,
        totalDistanceKm = dto.totalDistanceKm,
        freightAmount = dto.freightAmount,
        budgetEstimate = dto.budgetEstimate,
        dispatchedAt = dto.dispatchedAt,
        acceptedAt = dto.acceptedAt,
        acceptTimeoutMinutes = dto.acceptTimeoutMinutes,
        milestones = dto.milestones.map { toDomain(it) },
        sealNumber = dto.sealNumber,
        cargoCondition = dto.cargoCondition,
    )

    /**
     * Map a [MilestoneDto] to the domain [Milestone].
     */
    fun toDomain(dto: MilestoneDto): Milestone = Milestone(
        id = dto.id,
        type = parseMilestoneType(dto.type),
        sequenceNumber = dto.sequenceNumber,
        status = parseMilestoneStatus(dto.status),
        completedAt = dto.completedAt,
        latitude = dto.latitude,
        longitude = dto.longitude,
        gpsAccuracy = dto.gpsAccuracy,
        capturedData = dto.capturedData,
        evidenceIds = dto.evidenceIds,
        completedBy = dto.completedBy,
    )

    /**
     * Parse a milestone type string with fallback to DISPATCH.
     */
    private fun parseMilestoneType(raw: String): MilestoneType =
        MilestoneType.entries.firstOrNull { it.name == raw } ?: MilestoneType.DISPATCH

    /**
     * Parse a milestone status string with fallback to UPCOMING.
     */
    private fun parseMilestoneStatus(raw: String): MilestoneStatus =
        MilestoneStatus.entries.firstOrNull { it.name == raw } ?: MilestoneStatus.UPCOMING
}
