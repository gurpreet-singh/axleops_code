package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trips",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "trip_number"}))
@Getter
@Setter
public class Trip extends BaseEntity {

    @Column(name = "trip_number", nullable = false)
    private String tripNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_contract_id")
    private RouteContract routeContract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Contact driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    // ─── Status & Lifecycle ─────────────────────────────────────
    @Column(name = "status", length = 50)
    private String status = "CREATED"; // CREATED, DISPATCHED, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED

    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;

    @Column(name = "actual_start")
    private LocalDateTime actualStart;

    @Column(name = "actual_arrival")
    private LocalDateTime actualArrival;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // ─── Cargo ──────────────────────────────────────────────────
    @Column(name = "cargo_weight")
    private BigDecimal cargoWeight;

    @Column(name = "cargo_description", columnDefinition = "TEXT")
    private String cargoDescription;

    @Column(name = "lr_number")
    private String lrNumber;

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column(name = "consignment_value")
    private BigDecimal consignmentValue;

    // ─── Odometer ───────────────────────────────────────────────
    @Column(name = "start_odometer")
    private BigDecimal startOdometer;

    @Column(name = "end_odometer")
    private BigDecimal endOdometer;

    @Column(name = "distance_travelled")
    private BigDecimal distanceTravelled;

    // ─── Financials ─────────────────────────────────────────────
    private BigDecimal revenue;

    @Column(name = "fuel_cost")
    private BigDecimal fuelCost;

    @Column(name = "toll_cost")
    private BigDecimal tollCost;

    @Column(name = "driver_allowance")
    private BigDecimal driverAllowance;

    @Column(name = "other_expense")
    private BigDecimal otherExpense;

    @Column(name = "total_expense")
    private BigDecimal totalExpense;

    @Column(name = "net_profit")
    private BigDecimal netProfit;

    // ─── Invoice ────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    // ─── Delivery ───────────────────────────────────────────────
    @Column(name = "pod_status")
    private String podStatus; // PENDING, RECEIVED, VERIFIED

    @Column(name = "delivery_notes", columnDefinition = "TEXT")
    private String deliveryNotes;
}
