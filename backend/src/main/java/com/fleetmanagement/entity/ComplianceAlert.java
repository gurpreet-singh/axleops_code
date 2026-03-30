package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "compliance_alerts",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "document_type"}))
@Getter
@Setter
public class ComplianceAlert extends BaseEntity {

    @Column(name = "document_type", nullable = false)
    private String documentType; // Same enum as ComplianceDocument.documentType

    @Column(name = "alert_days_before", nullable = false)
    private String alertDaysBefore; // Comma-separated: "90,60,30,15,7"

    @Column(name = "alert_channels")
    private String alertChannels; // Comma-separated: "EMAIL,SMS,IN_APP"

    @Column(name = "auto_block_on_expiry")
    private Boolean autoBlockOnExpiry = false;

    @Column(name = "escalation_rules", columnDefinition = "TEXT")
    private String escalationRules; // JSON: escalation config
}
