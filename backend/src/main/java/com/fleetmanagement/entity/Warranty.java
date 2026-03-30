package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Vehicle warranty (OEM, extended, component-level).
 */
@Entity
@Table(name = "vehicle_warranties",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "policy_number"}))
@Getter
@Setter
public class Warranty extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "warranty_type", nullable = false)
    private String warrantyType; // OEM, EXTENDED, COMPONENT, TIRE, BATTERY

    @Column(nullable = false)
    private String provider;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "max_km")
    private Integer maxKm;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, CLAIMED, VOID

    @Column(name = "coverage_details", columnDefinition = "TEXT")
    private String coverageDetails;

    @Column(name = "policy_number")
    private String policyNumber;

    @Column(name = "claim_count")
    private Integer claimCount = 0;
}
