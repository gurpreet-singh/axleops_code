package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * Inspection Template master — defines checklist templates for vehicle/driver inspections.
 * Contains a list of check items (InspectionTemplateItemMaster).
 */
@Entity
@Table(name = "master_inspection_templates",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class InspectionTemplateMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_for", length = 10, nullable = false)
    private InspectionFor inspectionFor;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", length = 20, nullable = false)
    private InspectionTrigger triggerType;

    @Column(name = "is_mandatory", nullable = false)
    private boolean mandatory = false;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    private List<InspectionTemplateItemMaster> items = new ArrayList<>();
}
