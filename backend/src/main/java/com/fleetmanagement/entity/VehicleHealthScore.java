package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Computed vehicle health score (0-100) with per-factor breakdown.
 */
@Entity
@Table(name = "vehicle_health_scores")
@Getter
@Setter
public class VehicleHealthScore extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private Integer score; // 0-100

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @Column(name = "maintenance_score")
    private Integer maintenanceScore; // Based on service task compliance

    @Column(name = "issue_score")
    private Integer issueScore; // Based on open issue count/severity

    @Column(name = "inspection_score")
    private Integer inspectionScore; // Based on recent inspection results

    @Column(name = "compliance_score")
    private Integer complianceScore; // Based on compliance document expiry status

    @Column(name = "factors", columnDefinition = "TEXT")
    private String factors; // JSON: detailed factor breakdown
}
