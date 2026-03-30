package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class TripResponse {
    private UUID id;
    private String tripNumber;
    private String status;
    private String podStatus;

    // ─── Secondary Flags ────────────────────────────────────────
    private boolean reachedDestination;
    private LocalDateTime reachedDestinationAt;

    // ─── Lifecycle Timestamps ───────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime settledAt;
    private LocalDateTime cancelledAt;
    private String cancellationReason;

    // ─── Core Selection ─────────────────────────────────────────
    private UUID vehicleId;
    private String vehicleRegistration;
    private String vehicleOwnership;
    private UUID driverId;
    private String driverName;
    private UUID routeId;
    private String routeName;
    private String tripType;
    private UUID branchId;
    private String branchName;

    // ─── LR / Consignment Note ──────────────────────────────────
    private String lrNumber;
    private LocalDate lrDate;
    private LocalDate dispatchDate;
    private LocalTime dispatchTime;
    private String clientInvoiceNumbers;

    // ─── Parties ────────────────────────────────────────────────
    private UUID consignorId;
    private String consignorName;
    private UUID consigneeId;
    private String consigneeName;
    private UUID billingPartyId;
    private String billingPartyName;
    private UUID transporterId;
    private String transporterName;
    private String consignorAddress;
    private String consigneeAddress;

    // ─── Cargo Details ──────────────────────────────────────────
    private String cargoDescription;
    private String materialType;
    private BigDecimal weightKg;
    private Integer packagesCount;
    private BigDecimal consignmentValue;
    private String ewayBillNumber;
    private String riskType;
    private Integer trolleyPalletQty;

    // ─── Financial ──────────────────────────────────────────────
    private BigDecimal freightAmount;
    private String rateBasis;
    private BigDecimal rateValue;
    private String paymentTerms;
    private String loadingNote;

    // ─── Additional ─────────────────────────────────────────────
    private String permitNumber;
    private String documentNumber;
    private String remarks;

    // ─── Derived Route Fields ───────────────────────────────────
    private String originCity;
    private String destinationCity;
    private BigDecimal expectedDistanceKm;
    private Integer expectedTransitDays;
    private BigDecimal actualDistanceKm;

    // ─── Invoice link ───────────────────────────────────────────
    private UUID invoiceId;

    // ─── Computed Metrics ───────────────────────────────────────
    private BigDecimal detentionHours;
    private BigDecimal transitHours;
    private BigDecimal totalExpenses;
    private BigDecimal totalAdvances;
    private BigDecimal settlementBalance;
    private BigDecimal tripProfit;
}
