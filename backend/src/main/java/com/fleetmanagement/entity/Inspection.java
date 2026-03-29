package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * DVIR-style vehicle inspection record.
 */
@Entity
@Table(name = "vehicle_inspections")
@Getter
@Setter
public class Inspection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "form_type")
    private String formType = "DVIR"; // DVIR, PRE_TRIP, POST_TRIP, PERIODIC

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_id")
    private Contact inspector;

    @Column(name = "inspection_data", columnDefinition = "TEXT")
    private String inspectionData; // JSON: checklist items and results

    @Column(name = "overall_result", nullable = false)
    private String overallResult = "PASS"; // PASS, FAIL, CONDITIONAL

    @Column(name = "defects_found")
    private Integer defectsFound = 0;

    @Column(name = "defect_summary", columnDefinition = "TEXT")
    private String defectSummary;

    @Column(name = "odometer_reading")
    private Integer odometerReading;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
