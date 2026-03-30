package com.fleetmanagement.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateVehicleRequest {

    // ─── Core Identification ────────────────────────────────────
    private String registrationNumber;
    private String vehicleCategory;  // TRANSPORT, NON_TRANSPORT, PRIVATE, GOVERNMENT
    private UUID vehicleTypeId;
    private String make;
    private String model;
    private Integer year;
    private String mfgMonthYear;

    // ─── Chassis & Engine ───────────────────────────────────────
    private String chassisNumber;
    private String engineNumber;

    // ─── Physical Attributes ────────────────────────────────────
    private String color;
    private String bodyType;  // CLOSE_BODY, OPEN_BODY, TANKER, CONTAINER
    private String fuelType;  // DIESEL, PETROL, CNG, ELECTRIC, HYBRID
    private String axleConfig;
    private Integer ulwKg;
    private Integer rlwKg;
    private Integer payloadCapacityKg;
    private Integer seatingCapacity;
    private String hpCc;

    // ─── Meter ──────────────────────────────────────────────────
    private BigDecimal odometer;
    private String status;

    // ─── Registration Details ───────────────────────────────────
    private LocalDate registrationDate;
    private String registrationState;
    private String rtoOffice;

    // ─── Ownership ──────────────────────────────────────────────
    private String ownership;  // OWNED, LEASED, RENTED, MARKET
    private Boolean soldFlag;
    private String vehicleTypeMaster;
    private String hypothecation;

    // ─── Group & Assignment ─────────────────────────────────────
    private String vehicleGroup;
    private UUID groupId;
    private UUID branchId;
    private UUID clientId;
    private UUID operatorId;

    // ─── Compliance Expiry (denormalized) ───────────────────────
    private LocalDate insuranceExpiry;
    private LocalDate fitnessExpiry;
    private LocalDate permitExpiry;
}
