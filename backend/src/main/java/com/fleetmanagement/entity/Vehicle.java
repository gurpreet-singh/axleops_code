package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle extends BaseEntity {

    // ─── Core Identification ────────────────────────────────────
    @Column(name = "registration_number", nullable = false, length = 500)
    private String registrationNumber;

    @Column(name = "vehicle_category", length = 500)
    private String vehicleCategory; // TRANSPORT, NON_TRANSPORT, PRIVATE, GOVERNMENT

    @Column(name = "reference_number", length = 500)
    private String referenceNumber; // Internal reference / fleet code
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType vehicleType;

    @Column(length = 500)
    private String make;

    @Column(length = 500)
    private String model;

    @Column(name = "manufacture_year")
    private Integer year;

    @Column(name = "mfg_month_year", length = 500)
    private String mfgMonthYear; // Stored as "YYYY-MM" (e.g. "2022-03")

    // ─── Chassis & Engine ───────────────────────────────────────
    @Column(name = "chassis_number", length = 500)
    private String chassisNumber;

    @Column(name = "engine_number", length = 500)
    private String engineNumber;

    // ─── Physical Attributes ────────────────────────────────────
    @Column(length = 500)
    private String color;

    @Column(name = "body_type", length = 500)
    private String bodyType; // CLOSE_BODY, OPEN_BODY, TANKER, CONTAINER, etc.

    @Column(name = "fuel_type", length = 500)
    private String fuelType = "DIESEL"; // DIESEL, PETROL, CNG, ELECTRIC, HYBRID

    @Column(name = "axle_config", length = 500)
    private String axleConfig; // 6x4, 4x2, etc.

    @Column(name = "ulw_kg")
    private Integer ulwKg; // Unladen weight

    @Column(name = "rlw_kg")
    private Integer rlwKg; // Registered laden weight / GVW

    @Column(name = "payload_capacity_kg")
    private Integer payloadCapacityKg;

    @Column(name = "seating_capacity")
    private Integer seatingCapacity;

    @Column(name = "hp_cc", length = 500)
    private String hpCc; // Horsepower / engine CC

    // ─── Meter & Status ─────────────────────────────────────────
    private BigDecimal odometer;

    @Column(length = 500)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, IN_MAINTENANCE, SOLD, SCRAPPED

    // ─── Registration Details ───────────────────────────────────
    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "registration_state", length = 500)
    private String registrationState;

    @Column(name = "rto_office", length = 500)
    private String rtoOffice;

    // ─── Ownership ──────────────────────────────────────────────
    @Column(length = 500)
    private String ownership; // OWNED, LEASED, RENTED, MARKET

    @Column(name = "customer_name", length = 500)
    private String customerName; // Registered owner name (from RTO)

    @Column(name = "sold_flag")
    private Boolean soldFlag;

    @Column(name = "vehicle_type_master", length = 500)
    private String vehicleTypeMaster; // Classification code (e.g., 9 MT 32 FEET)

    @Column(length = 500)
    private String hypothecation; // Hypothecation details (bank/financer)

    // ─── Group & Assignment ─────────────────────────────────────
    @Column(name = "vehicle_group", length = 500)
    private String vehicleGroup;

    @Column(name = "group_id")
    private java.util.UUID groupId;

    // ─── Relationships ──────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private Contact operator;
}
