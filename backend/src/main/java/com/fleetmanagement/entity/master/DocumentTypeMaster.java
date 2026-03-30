package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Document Type master — defines compliance documents tracked for vehicles and drivers.
 * Drives expiry reminders, trip assignment blocking, compliance dashboard.
 */
@Entity
@Table(name = "master_document_types",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class DocumentTypeMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "applies_to", length = 10, nullable = false)
    private DocumentAppliesTo appliesTo;

    @Column(name = "is_mandatory", nullable = false)
    private boolean mandatory = false;

    @Column(name = "has_expiry", nullable = false)
    private boolean hasExpiry = true;

    @Column(name = "remind_days_before")
    private Integer remindDaysBefore = 30;

    @Column(name = "escalation_days_before")
    private Integer escalationDaysBefore = 7;

    @Column(name = "block_on_expiry", nullable = false)
    private boolean blockOnExpiry = false;
}
