package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Equipment Type master — categorises non-vehicle assets (GPS, dashcam, tarpaulin, etc.)
 */
@Entity
@Table(name = "master_equipment_types",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class EquipmentTypeMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private EquipmentCategory category;

    /** If true, each unit has a unique serial number (e.g. GPS devices) */
    @Column(name = "is_serialized", nullable = false)
    private boolean serialized = false;

    @Column(name = "expected_life_months")
    private Integer expectedLifeMonths;

    @Column(name = "unit_cost", precision = 12, scale = 2)
    private BigDecimal unitCost;
}
