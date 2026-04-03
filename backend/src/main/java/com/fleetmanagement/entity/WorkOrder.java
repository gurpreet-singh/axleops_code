package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "work_orders",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "work_order_number"}))
@Getter
@Setter
public class WorkOrder extends BaseEntity {

    @Column(name = "work_order_number", nullable = false, length = 100)
    private String workOrderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "work_order_type", length = 50)
    private String workOrderType = "REACTIVE"; // SCHEDULED, REACTIVE, BREAKDOWN, INSPECTION

    @Column(name = "status", length = 50)
    private String status = "OPEN"; // OPEN, IN_PROGRESS, PENDING_PARTS, COMPLETED, CANCELLED

    @Column(name = "priority", length = 50)
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, CRITICAL

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    // ─── Cost Breakdown ─────────────────────────────────────────
    @Column(name = "labor_cost")
    private BigDecimal laborCost;

    @Column(name = "parts_cost")
    private BigDecimal partsCost;

    @Column(name = "total_cost")
    private BigDecimal totalCost;

    @Column(name = "odometer_reading")
    private BigDecimal odometerReading;

    // ─── Tasks & Notes ──────────────────────────────────────────
    @Column(name = "service_tasks", length = 500)
    private String serviceTasks;

    @Column(length = 100)
    private String label;

    @Column(name = "technician_notes", columnDefinition = "TEXT")
    private String technicianNotes;

    // ─── Relationships ──────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private User vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "issue_id")
    private java.util.UUID issueId;

    @Column(name = "service_task_id")
    private java.util.UUID serviceTaskId;
}