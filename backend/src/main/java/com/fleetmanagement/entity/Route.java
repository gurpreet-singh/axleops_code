package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "routes")
@Getter
@Setter
public class Route extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String origin;

    private String destination;

    @Column(name = "distance_km")
    private BigDecimal distanceKm;

    @Column(name = "estimated_hours")
    private BigDecimal estimatedHours;

    @Column(name = "toll_cost")
    private BigDecimal tollCost;

    private String via;

    @Column(name = "origin_pin")
    private String originPin;

    @Column(name = "dest_pin")
    private String destPin;

    @Column(name = "sla_hours")
    private Integer slaHours;

    @Column(name = "payment_terms")
    private String paymentTerms;

    private String template;

    private String status = "ACTIVE";

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "billing_type")
    private String billingType;

    @Column(name = "document_series")
    private String documentSeries;

    // ── Charge columns (per-trip invoice template) ───────────────
    @Column(name = "freight_rate")
    private BigDecimal freightRate;

    @Column(name = "gds_charges")
    private BigDecimal gdsCharges;

    @Column(name = "st_charges")
    private BigDecimal stCharges;

    private BigDecimal insurance;

    @Column(name = "loading_charges")
    private BigDecimal loadingCharges;

    @Column(name = "unloading_charges")
    private BigDecimal unloadingCharges;

    @Column(name = "delivery_charges")
    private BigDecimal deliveryCharges;

    @Column(name = "collection_charges")
    private BigDecimal collectionCharges;

    @Column(name = "detention_charges")
    private BigDecimal detentionCharges;

    @Column(name = "godown_charges")
    private BigDecimal godownCharges;

    @Column(name = "lr_charges")
    private BigDecimal lrCharges;

    @Column(name = "other_charges")
    private BigDecimal otherCharges;

    // ── Operational expense defaults ─────────────────────────────
    @Column(name = "driver_expense")
    private BigDecimal driverExpense;

    @Column(name = "diesel_litres")
    private BigDecimal dieselLitres;

    // ── Instructions ─────────────────────────────────────────────
    @Column(name = "loading_instructions", length = 1000)
    private String loadingInstructions;

    @Column(name = "unloading_instructions", length = 1000)
    private String unloadingInstructions;

    // ── Relationships ────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ledger_account_id")
    private LedgerAccount ledgerAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_type_id")
    private InvoiceType invoiceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annexure_type_id")
    private AnnexureType annexureType;
}
