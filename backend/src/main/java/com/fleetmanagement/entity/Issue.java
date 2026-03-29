package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Tracks reported issues/defects on a vehicle.
 * Can optionally be linked to a WorkOrder for resolution.
 */
@Entity
@Table(name = "vehicle_issues")
@Getter
@Setter
public class Issue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "issue_number", unique = true)
    private String issueNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, DEFERRED

    @Column(nullable = false)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "category")
    private String category; // MECHANICAL, ELECTRICAL, BODY, TIRE, BRAKE, OTHER

    @Column(name = "reported_date", nullable = false)
    private LocalDate reportedDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by")
    private Contact reportedBy;

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "odometer_at_report")
    private Integer odometerAtReport;
}
