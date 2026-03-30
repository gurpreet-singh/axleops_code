package com.fleetmanagement.mapper;


import com.fleetmanagement.dto.response.*;
import com.fleetmanagement.entity.*;
import org.springframework.stereotype.Component;

/**
 * Manual Trip mapper — avoids MapStruct complexity with the
 * deeply-nested entity relationships and computed fields.
 */
@Component
public class TripMapper {

    public TripResponse toResponse(Trip t) {
        TripResponse r = new TripResponse();
        r.setId(t.getId());
        r.setTripNumber(t.getTripNumber());
        r.setStatus(t.getStatus() != null ? t.getStatus().name() : null);
        r.setPodStatus(t.getPodStatus() != null ? t.getPodStatus().name() : null);
        r.setReachedDestination(t.isReachedDestination());
        r.setReachedDestinationAt(t.getReachedDestinationAt());

        // Lifecycle
        r.setCreatedAt(t.getCreatedAt());
        r.setStartedAt(t.getStartedAt());
        r.setDeliveredAt(t.getDeliveredAt());
        r.setSettledAt(t.getSettledAt());
        r.setCancelledAt(t.getCancelledAt());
        r.setCancellationReason(t.getCancellationReason());

        // Vehicle
        if (t.getVehicle() != null) {
            r.setVehicleId(t.getVehicle().getId());
            r.setVehicleRegistration(t.getVehicle().getRegistrationNumber());
        }
        r.setVehicleOwnership(t.getVehicleOwnership());

        // Driver
        if (t.getDriver() != null) {
            r.setDriverId(t.getDriver().getId());
            r.setDriverName(t.getDriver().getFirstName()
                    + (t.getDriver().getLastName() != null ? " " + t.getDriver().getLastName() : ""));
        }

        // Route
        if (t.getRoute() != null) {
            r.setRouteId(t.getRoute().getId());
            r.setRouteName(t.getRoute().getName());
        }

        r.setTripType(t.getTripType() != null ? t.getTripType().name() : null);

        // Branch
        if (t.getBranch() != null) {
            r.setBranchId(t.getBranch().getId());
            r.setBranchName(t.getBranch().getName());
        }

        // LR
        r.setLrNumber(t.getLrNumber());
        r.setLrDate(t.getLrDate());
        r.setDispatchDate(t.getDispatchDate());
        r.setDispatchTime(t.getDispatchTime());
        r.setClientInvoiceNumbers(t.getClientInvoiceNumbers());

        // Parties
        if (t.getConsignor() != null) {
            r.setConsignorId(t.getConsignor().getId());
            r.setConsignorName(t.getConsignor().getAccountHead());
        } else if (t.getConsignorName() != null) {
            r.setConsignorName(t.getConsignorName());
        }
        if (t.getConsignee() != null) {
            r.setConsigneeId(t.getConsignee().getId());
            r.setConsigneeName(t.getConsignee().getAccountHead());
        } else if (t.getConsigneeName() != null) {
            r.setConsigneeName(t.getConsigneeName());
        }
        if (t.getBillingParty() != null) {
            r.setBillingPartyId(t.getBillingParty().getId());
            r.setBillingPartyName(t.getBillingParty().getAccountHead());
        }
        if (t.getTransporter() != null) {
            r.setTransporterId(t.getTransporter().getId());
            r.setTransporterName(t.getTransporter().getAccountHead());
        }
        r.setConsignorAddress(t.getConsignorAddress());
        r.setConsigneeAddress(t.getConsigneeAddress());

        // Cargo
        r.setCargoDescription(t.getCargoDescription());
        r.setMaterialType(t.getMaterialType());
        r.setWeightKg(t.getWeightKg());
        r.setPackagesCount(t.getPackagesCount());
        r.setConsignmentValue(t.getConsignmentValue());
        r.setEwayBillNumber(t.getEwayBillNumber());
        r.setRiskType(t.getRiskType() != null ? t.getRiskType().name() : null);
        r.setTrolleyPalletQty(t.getTrolleyPalletQty());

        // Financial
        r.setFreightAmount(t.getFreightAmount());
        r.setRateBasis(t.getRateBasis() != null ? t.getRateBasis().name() : null);
        r.setRateValue(t.getRateValue());
        r.setPaymentTerms(t.getPaymentTerms() != null ? t.getPaymentTerms().name() : null);
        r.setLoadingNote(t.getLoadingNote());

        // Additional
        r.setPermitNumber(t.getPermitNumber());
        r.setDocumentNumber(t.getDocumentNumber());
        r.setRemarks(t.getRemarks());

        // Derived route fields
        r.setOriginCity(t.getOriginCity());
        r.setDestinationCity(t.getDestinationCity());
        r.setExpectedDistanceKm(t.getExpectedDistanceKm());
        r.setExpectedTransitDays(t.getExpectedTransitDays());
        r.setActualDistanceKm(t.getActualDistanceKm());

        // Invoice
        r.setInvoiceId(t.getInvoiceId());

        return r;
    }

    public TripExpenseResponse toExpenseResponse(TripExpense e) {
        TripExpenseResponse r = new TripExpenseResponse();
        r.setId(e.getId());
        r.setTripId(e.getTripId());
        r.setExpenseCategoryId(e.getExpenseCategoryId());
        r.setExpenseCategoryName(e.getExpenseCategoryName());
        r.setAmount(e.getAmount());
        r.setExpenseDate(e.getExpenseDate());
        r.setDescription(e.getDescription());
        r.setPaymentMode(e.getPaymentMode() != null ? e.getPaymentMode().name() : null);
        r.setReceiptUrl(e.getReceiptUrl());
        r.setFuelPumpAccountId(e.getFuelPumpAccountId());
        r.setFuelLitres(e.getFuelLitres());
        r.setFuelRatePerLitre(e.getFuelRatePerLitre());
        r.setOdometerReading(e.getOdometerReading());
        r.setLoggedBy(e.getLoggedBy());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }

    public TripAdvanceResponse toAdvanceResponse(TripAdvance a) {
        TripAdvanceResponse r = new TripAdvanceResponse();
        r.setId(a.getId());
        r.setTripId(a.getTripId());
        r.setDriverId(a.getDriverId());
        r.setAmount(a.getAmount());
        r.setPaymentMode(a.getPaymentMode() != null ? a.getPaymentMode().name() : null);
        r.setSourceAccountId(a.getSourceAccountId());
        r.setGivenDate(a.getGivenDate());
        r.setGivenBy(a.getGivenBy());
        r.setNotes(a.getNotes());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }

    public TripDocumentResponse toDocumentResponse(TripDocument d) {
        TripDocumentResponse r = new TripDocumentResponse();
        r.setId(d.getId());
        r.setTripId(d.getTripId());
        r.setDocumentType(d.getDocumentType() != null ? d.getDocumentType().name() : null);
        r.setDocumentNumber(d.getDocumentNumber());
        r.setStatus(d.getStatus() != null ? d.getStatus().name() : null);
        r.setFileUrl(d.getFileUrl());
        r.setFileName(d.getFileName());
        r.setMimeType(d.getMimeType());
        r.setUploadedAt(d.getUploadedAt());
        r.setUploadedBy(d.getUploadedBy());
        r.setVerifiedAt(d.getVerifiedAt());
        r.setVerifiedBy(d.getVerifiedBy());
        r.setRejectionReason(d.getRejectionReason());
        r.setNotes(d.getNotes());
        return r;
    }
}
