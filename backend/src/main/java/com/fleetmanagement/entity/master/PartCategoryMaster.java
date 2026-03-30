package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Part Category master — hierarchical categorisation of spare parts and consumables.
 * Supports 2-3 levels of nesting via self-referencing parent_id.
 */
@Entity
@Table(name = "master_part_categories",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class PartCategoryMaster extends MasterEntity {

    @Column(name = "parent_id")
    private UUID parentId;

    /** Icon identifier for UI display (CSS class or icon library key) */
    private String icon;
}
