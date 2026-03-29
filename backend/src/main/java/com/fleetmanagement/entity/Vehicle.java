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
    @Column(name = "registration_number", nullable = false)
    private String registrationNumber;

    @Column(name = "vehicle_category")
    private String vehicleCategory; // TRANSPORT, NON_TRANSPORT, PRIVATE, GOVERNMENT

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType vehicleType;

    private String make;
    private String model;

    @Column(name = "manufacture_year")
    private Integer year;

    @Column(name = "mfg_month_year")
    private LocalDate mfgMonthYear;

    // ─── Chassis & Engine ───────────────────────────────────────
    @Column(name = "chassis_number")
    private String chassisNumber;

    @Column(name = "engine_number")
    private String engineNumber;

    // ─── Physical Attributes ────────────────────────────────────
    private String color;

    @Column(name = "body_type")
    private String bodyType; // CLOSE_BODY, OPEN_BODY, TANKER, CONTAINER, etc.

    @Column(name = "fuel_type")
    private String fuelType = "DIESEL"; // DIESEL, PETROL, CNG, ELECTRIC, HYBRID

    @Column(name = "axle_config")
    private String axleConfig; // 6x4, 4x2, etc.

    @Column(name = "ulw_kg")
    private Integer ulwKg; // Unladen weight

    @Column(name = "rlw_kg")
    private Integer rlwKg; // Registered laden weight / GVW

    @Column(name = "payload_capacity_kg")
    private Integer payloadCapacityKg;

    @Column(name = "seating_capacity")
    private Integer seatingCapacity;

    @Column(name = "hp_cc")
    private String hpCc; // Horsepower / engine CC

    // ─── Meter & Status ─────────────────────────────────────────
    private BigDecimal odometer;
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, IN_MAINTENANCE, SOLD, SCRAPPED

    // ─── Registration Details ───────────────────────────────────
    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "registration_state")
    private String registrationState;

    @Column(name = "rto_office")
    private String rtoOffice;

    // ─── Ownership ──────────────────────────────────────────────
    private String ownership; // OWNED, LEASED, RENTED, MARKET

    @Column(name = "sold_flag")
    private Boolean soldFlag;

    @Column(name = "vehicle_type_master")
    private String vehicleTypeMaster; // Classification code (e.g., 9 MT 32 FEET)

    private String hypothecation; // Hypothecation details (bank/financer)

    // ─── Group & Assignment ─────────────────────────────────────
    @Column(name = "vehicle_group")
    private String vehicleGroup;

    @Column(name = "group_id")
    private java.util.UUID groupId;

    // ─── Compliance Expiry (denormalized caches — Phase 2 will derive from ComplianceDocument) ──
    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(name = "fitness_expiry")
    private LocalDate fitnessExpiry;

    @Column(name = "permit_expiry")
    private LocalDate permitExpiry;

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
