package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "routes")
@Getter
@Setter
public class Route extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(name = "distance_km")
    private java.math.BigDecimal distanceKm;

    @Column(name = "estimated_hours")
    private java.math.BigDecimal estimatedHours;

    @Column(name = "toll_cost")
    private java.math.BigDecimal tollCost;

    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
