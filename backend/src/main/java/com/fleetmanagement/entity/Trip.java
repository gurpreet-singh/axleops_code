package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "trips")
@Getter
@Setter
public class Trip extends BaseEntity {

    @Column(name = "trip_number", nullable = false, unique = true)
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

    @Column(name = "status", length = 50)
    private String status = "CREATED";

    @Column(name = "scheduled_start")
    private java.time.LocalDateTime scheduledStart;

    @Column(name = "actual_start")
    private java.time.LocalDateTime actualStart;

    @Column(name = "actual_arrival")
    private java.time.LocalDateTime actualArrival;

    @Column(name = "cargo_weight")
    private java.math.BigDecimal cargoWeight;

    @Column(name = "cargo_description", columnDefinition = "TEXT")
    private String cargoDescription;

    @Column(name = "lr_number")
    private String lrNumber;

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column(name = "consignment_value")
    private java.math.BigDecimal consignmentValue;

    private java.math.BigDecimal revenue;

    @Column(name = "net_profit")
    private java.math.BigDecimal netProfit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;
}
