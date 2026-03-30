package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Freight rates per route per vehicle type per company.
 * Operational data that belongs to Company, not LedgerAccount.
 * Used for rate negotiation and trip costing.
 */
@Entity
@Table(name = "freight_rates",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "company_id", "origin", "destination", "vehicle_type"}))
@Getter
@Setter
public class FreightRate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal rate;

    @Column(name = "rate_basis", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RateBasis rateBasis; // PER_TRIP, PER_KM, PER_TON

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    public enum RateBasis {
        PER_TRIP, PER_KM, PER_TON
    }
}
