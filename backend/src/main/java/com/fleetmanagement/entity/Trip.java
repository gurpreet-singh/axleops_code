package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "trips",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "trip_number"}))
@Getter
@Setter
public class Trip extends BaseEntity {

    // ─── System Fields ──────────────────────────────────────────
    @Column(name = "trip_number", nullable = false)
    private String tripNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private TripStatus status = TripStatus.CREATED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    // ─── Secondary Flags ────────────────────────────────────────
    @Column(name = "reached_destination")
    private boolean reachedDestination = false;

    @Column(name = "reached_destination_at")
    private LocalDateTime reachedDestinationAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "pod_status", length = 20)
    private PodStatus podStatus = PodStatus.PENDING;

    // ─── Lifecycle Timestamps ───────────────────────────────────
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    // ─── Core Selection ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Contact driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @Enumerated(EnumType.STRING)
    @Column(name = "trip_type", length = 20)
    private TripType tripType = TripType.FTL;

    @Column(name = "vehicle_ownership", length = 20)
    private String vehicleOwnership; // OWN, ATTACHED, MARKET — derived from Vehicle

    // ─── LR / Consignment Note ──────────────────────────────────
    @Column(name = "lr_number")
    private String lrNumber;

    @Column(name = "lr_date")
    private LocalDate lrDate;

    @Column(name = "dispatch_date")
    private LocalDate dispatchDate;

    @Column(name = "dispatch_time")
    private LocalTime dispatchTime;

    @Column(name = "client_invoice_numbers")
    private String clientInvoiceNumbers;

    // ─── Parties ────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consignor_id")
    private LedgerAccount consignor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consignee_id")
    private LedgerAccount consignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_party_id")
    private LedgerAccount billingParty;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transporter_id")
    private LedgerAccount transporter;

    @Column(name = "consignor_name")
    private String consignorName;

    @Column(name = "consignee_name")
    private String consigneeName;

    @Column(name = "consignor_address", columnDefinition = "TEXT")
    private String consignorAddress;

    @Column(name = "consignee_address", columnDefinition = "TEXT")
    private String consigneeAddress;

    // ─── Cargo Details ──────────────────────────────────────────
    @Column(name = "cargo_description", columnDefinition = "TEXT")
    private String cargoDescription;

    @Column(name = "material_type")
    private String materialType;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "packages_count")
    private Integer packagesCount;

    @Column(name = "consignment_value")
    private BigDecimal consignmentValue;

    @Column(name = "eway_bill_number")
    private String ewayBillNumber;

    @Column(name = "eway_bill_expiry")
    private LocalDateTime ewayBillExpiry;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_type", length = 20)
    private RiskType riskType = RiskType.CARRIER_RISK;

    @Column(name = "trolley_pallet_qty")
    private Integer trolleyPalletQty;

    // ─── Financial ──────────────────────────────────────────────
    @Column(name = "freight_amount")
    private BigDecimal freightAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "rate_basis", length = 20)
    private RateBasis rateBasis;

    @Column(name = "rate_value")
    private BigDecimal rateValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_terms", length = 20)
    private PaymentTerms paymentTerms = PaymentTerms.TO_BE_BILLED;

    @Column(name = "loading_note", columnDefinition = "TEXT")
    private String loadingNote;

    // ─── Additional / Optional ──────────────────────────────────
    @Column(name = "permit_number")
    private String permitNumber;

    @Column(name = "document_number")
    private String documentNumber;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // ─── Derived Route Fields (denormalized) ────────────────────
    @Column(name = "origin_city")
    private String originCity;

    @Column(name = "destination_city")
    private String destinationCity;

    @Column(name = "expected_distance_km")
    private BigDecimal expectedDistanceKm;

    @Column(name = "expected_transit_days")
    private Integer expectedTransitDays;

    @Column(name = "actual_distance_km")
    private BigDecimal actualDistanceKm;

    // ─── Invoice Link ───────────────────────────────────────────
    @Column(name = "invoice_id")
    private UUID invoiceId;
}
