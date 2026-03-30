package com.fleetmanagement.entity.master;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Inspection Template Item — an ordered check item within an InspectionTemplate.
 * Not a MasterEntity itself (no tenant_id, no code) — it's a child record.
 */
@Entity
@Table(name = "master_inspection_template_items")
@Getter @Setter
public class InspectionTemplateItemMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private InspectionTemplateMaster template;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", length = 20, nullable = false)
    private InspectionItemType itemType;

    /** For MULTI_CHOICE: JSON array of options, e.g. ["Good","Acceptable","Needs Repair"] */
    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(name = "is_mandatory", nullable = false)
    private boolean mandatory = true;

    /** If true, a FAIL triggers an immediate alert to the fleet manager */
    @Column(name = "fail_triggers_alert")
    private boolean failTriggersAlert = false;

    /** If true, inspector must take a photo when this item fails */
    @Column(name = "photo_required_on_fail")
    private boolean photoRequiredOnFail = false;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder = 0;
}
