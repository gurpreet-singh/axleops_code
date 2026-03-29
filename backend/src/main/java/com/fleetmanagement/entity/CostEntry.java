package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Individual cost entry for tracking total cost of ownership.
 * Can reference a work order, trip, or standalone expense.
 */
@Entity
@Table(name = "vehicle_cost_entries")
@Getter
@Setter
public class CostEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "cost_category", nullable = false)
    private String costCategory; // FUEL, MAINTENANCE, INSURANCE, TOLL, PARKING, FINE, TAX, TIRE, OTHER

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "cost_date", nullable = false)
    private LocalDate costDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ─── Reference to source entity ─────────────────────────────
    @Column(name = "reference_type")
    private String referenceType; // WORK_ORDER, TRIP, COMPLIANCE, MANUAL

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "odometer_reading")
    private Integer odometerReading;

    @Column(name = "vendor_name")
    private String vendorName;

    @Column(name = "invoice_number")
    private String invoiceNumber;
}
