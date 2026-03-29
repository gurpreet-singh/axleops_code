package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Records a fuel fill-up event for a vehicle.
 * Tracks quantity, cost, odometer, and computes mileage.
 */
@Entity
@Table(name = "fuel_entries")
@Getter
@Setter
public class FuelEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "fill_date", nullable = false)
    private LocalDate fillDate;

    @Column(name = "fill_time")
    private LocalDateTime fillTime;

    @Column(name = "fuel_type")
    private String fuelType = "DIESEL"; // DIESEL, PETROL, CNG, ELECTRIC

    @Column(name = "quantity_litres", nullable = false)
    private BigDecimal quantityLitres;

    @Column(name = "rate_per_litre")
    private BigDecimal ratePerLitre;

    @Column(name = "total_cost", nullable = false)
    private BigDecimal totalCost;

    @Column(name = "odometer_reading")
    private BigDecimal odometerReading;

    @Column(name = "previous_odometer")
    private BigDecimal previousOdometer;

    @Column(name = "mileage_kmpl")
    private BigDecimal mileageKmpl; // Computed: (odometer - previousOdometer) / quantityLitres

    @Column(name = "fill_type")
    private String fillType = "FULL"; // FULL, PARTIAL

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "station_location")
    private String stationLocation;

    @Column(name = "receipt_number")
    private String receiptNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Contact driver;

    @Column(name = "trip_id")
    private java.util.UUID tripId;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
