package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Recurring maintenance task template for a vehicle.
 * Tracks interval-based schedules (by months or KM).
 */
@Entity
@Table(name = "service_tasks",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "vehicle_id", "name"}))
@Getter
@Setter
public class ServiceTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private String name; // e.g. "Engine Oil Change", "Brake Pad Replacement"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "task_type")
    private String taskType = "PREVENTIVE"; // PREVENTIVE, CORRECTIVE, REGULATORY

    @Column(name = "status")
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, OVERDUE, CANCELLED

    // ─── Interval-Based Scheduling ──────────────────────────────
    @Column(name = "interval_months")
    private Integer intervalMonths;

    @Column(name = "interval_km")
    private Integer intervalKm;

    // ─── Next Due ───────────────────────────────────────────────
    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "next_due_km")
    private Integer nextDueKm;

    // ─── Last Completed ─────────────────────────────────────────
    @Column(name = "last_completed_date")
    private LocalDate lastCompletedDate;

    @Column(name = "last_completed_km")
    private Integer lastCompletedKm;

    @Column(name = "estimated_cost")
    private BigDecimal estimatedCost;

    @Column(name = "compliance_pct")
    private Integer compliancePct; // 0-100, how on-schedule this task is

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
