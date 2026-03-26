package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "route_contracts")
@Getter
@Setter
public class RouteContract extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "freight_rate")
    private java.math.BigDecimal freightRate;

    @Column(name = "rate_type")
    private String rateType = "PER_TRIP";

    @Column(name = "loading_charges")
    private java.math.BigDecimal loadingCharges;

    @Column(name = "unloading_charges")
    private java.math.BigDecimal unloadingCharges;

    @Column(name = "detention_charges_per_day")
    private java.math.BigDecimal detentionChargesPerDay;

    @Column(name = "effective_from")
    private java.time.LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private java.time.LocalDate effectiveTo;

    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
