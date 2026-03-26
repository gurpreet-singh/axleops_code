package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "work_orders")
@Getter
@Setter
public class WorkOrder extends BaseEntity {

    @Column(name = "work_order_number", nullable = false, unique = true, length = 100)
    private String workOrderNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "status", length = 50)
    private String status = "OPEN"; // OPEN, PENDING, COMPLETED

    @Column(name = "priority", length = 50)
    private String priority = "NORMAL";

    @Column(name = "total_cost")
    private java.math.BigDecimal totalCost;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private Contact assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}