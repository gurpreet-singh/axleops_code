package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Tracks driver↔vehicle assignment timeline.
 * Enables "who drove which vehicle when" queries.
 */
@Entity
@Table(name = "driver_assignment_history")
@Getter
@Setter
public class DriverAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Contact driver;

    @Column(name = "assigned_from", nullable = false)
    private LocalDate assignedFrom;

    @Column(name = "assigned_to")
    private LocalDate assignedTo; // null = currently assigned

    @Column(name = "assignment_type")
    private String assignmentType = "PRIMARY"; // PRIMARY, SECONDARY, TEMPORARY

    @Column(name = "is_current")
    private Boolean isCurrent = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
