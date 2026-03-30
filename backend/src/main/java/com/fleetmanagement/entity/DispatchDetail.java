package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Dispatch details per company — operational data that belongs to Company, not LedgerAccount.
 * Stores origin/destination/vehicle_type combinations that a company dispatches from.
 */
@Entity
@Table(name = "dispatch_details",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "company_id", "origin", "destination", "vehicle_type"}))
@Getter
@Setter
public class DispatchDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String origin; // e.g. "Nashik"

    @Column(nullable = false)
    private String destination; // e.g. "Chakan"

    @Column(name = "vehicle_type")
    private String vehicleType;
}
