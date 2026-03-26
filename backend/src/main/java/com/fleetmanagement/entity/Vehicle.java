package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
public class Vehicle extends BaseEntity {

    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType vehicleType;

    private String make;
    private String model;
    @Column(name = "manufacture_year")
    private Integer year;

    @Column(name = "chassis_number")
    private String chassisNumber;

    @Column(name = "engine_number")
    private String engineNumber;

    private String color;

    @Column(name = "fuel_type")
    private String fuelType = "DIESEL";

    private java.math.BigDecimal odometer;
    private String status = "ACTIVE";

    @Column(name = "insurance_expiry")
    private java.time.LocalDate insuranceExpiry;

    @Column(name = "fitness_expiry")
    private java.time.LocalDate fitnessExpiry;

    @Column(name = "permit_expiry")
    private java.time.LocalDate permitExpiry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
