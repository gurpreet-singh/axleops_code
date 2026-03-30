package com.fleetmanagement.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class VehicleResponse {

    private UUID id;

    // ─── Core Identification ────────────────────────────────────
    private String registrationNumber;
    private String vehicleCategory;
    private Integer year;
    private String make;
    private String model;
    private String mfgMonthYear;

    // ─── Chassis & Engine ───────────────────────────────────────
    private String chassisNumber;
    private String engineNumber;

    // ─── Physical Attributes ────────────────────────────────────
    private String color;
    private String bodyType;
    private String fuelType;
    private String axleConfig;
    private Integer ulwKg;
    private Integer rlwKg;
    private Integer payloadCapacityKg;
    private Integer seatingCapacity;
    private String hpCc;

    // ─── Meter & Status ─────────────────────────────────────────
    private BigDecimal odometer;
    private String status;

    // ─── Registration Details ───────────────────────────────────
    private LocalDate registrationDate;
    private String registrationState;
    private String rtoOffice;

    // ─── Ownership ──────────────────────────────────────────────
    private String ownership;
    private Boolean soldFlag;
    private String vehicleTypeMaster;
    private String hypothecation;

    // ─── Group & Assignment (flattened FK names) ────────────────
    private String vehicleGroup;
    private UUID groupId;

    private UUID vehicleTypeId;
    private String vehicleTypeName;

    private UUID branchId;
    private String branchName;

    private UUID clientId;
    private String clientName;

    private UUID operatorId;
    private String operatorName;

    // ─── Compliance Expiry (denormalized caches) ────────────────
    private LocalDate insuranceExpiry;
    private LocalDate fitnessExpiry;
    private LocalDate permitExpiry;
}
