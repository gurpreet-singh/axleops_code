package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Number Series master — auto-numbering config for invoices, LR, vouchers, etc.
 * Generates sequential numbers with configurable prefix, FY, and padding.
 */
@Entity
@Table(name = "master_number_series",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "entity_type"}))
@Getter @Setter
public class NumberSeriesMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", length = 30, nullable = false)
    private NumberSeriesEntityType entityType;

    private String prefix;

    private String suffix;

    @Column(name = "include_fy")
    private boolean includeFy = true;

    @Column(name = "fy_separator", length = 5)
    private String fySeparator = "-";

    @Column(name = "padding_length", nullable = false)
    private int paddingLength = 5;

    @Column(name = "current_value", nullable = false)
    private long currentValue = 0;

    @Column(name = "reset_on_fy", nullable = false)
    private boolean resetOnFy = true;

    @Column(name = "fiscal_year_start_month")
    private Integer fiscalYearStartMonth = 4;
}
