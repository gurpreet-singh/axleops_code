package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Service Type master — categorises maintenance and repair activities.
 * Used in service records, preventive maintenance scheduling, cost analysis.
 */
@Entity
@Table(name = "master_service_types",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter @Setter
public class ServiceTypeMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ServiceCategory category;

    @Column(name = "is_scheduled", nullable = false)
    private boolean scheduled = false;

    @Column(name = "default_interval_km")
    private Integer defaultIntervalKm;

    @Column(name = "default_interval_days")
    private Integer defaultIntervalDays;

    @Column(name = "estimated_duration_hours", precision = 6, scale = 2)
    private BigDecimal estimatedDurationHours;

    @Column(name = "estimated_cost", precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Column(name = "requires_parts")
    private Boolean requiresParts;
}
