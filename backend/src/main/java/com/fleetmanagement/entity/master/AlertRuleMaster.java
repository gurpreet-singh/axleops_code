package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Alert Rule master — configurable threshold-based notification triggers.
 * Used for fuel anomalies, expense outliers, document expiry, payment overdue, etc.
 */
@Entity
@Table(name = "master_alert_rules",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "code"}))
@Getter @Setter
public class AlertRuleMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", length = 30, nullable = false)
    private AlertType alertType;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_operator", length = 20, nullable = false)
    private ConditionOperator conditionOperator;

    @Column(name = "threshold_value", precision = 12, scale = 2, nullable = false)
    private BigDecimal thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private AlertSeverity severity;

    /** JSON array of role enum names: ["OWNER_DIRECTOR","FLEET_MANAGER"] */
    @Column(name = "notify_roles", columnDefinition = "TEXT")
    private String notifyRoles;

    @Column(name = "notify_whatsapp")
    private boolean notifyWhatsapp = false;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "cooldown_hours")
    private Integer cooldownHours = 24;
}
