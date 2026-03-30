package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit record for vehicle/driver/equipment transfers between branches.
 * Created whenever a resource's branch_id is updated.
 */
@Entity
@Table(name = "resource_transfers")
@Getter
@Setter
public class ResourceTransfer {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "resource_type", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType; // VEHICLE, DRIVER, EQUIPMENT

    @Column(name = "resource_id", nullable = false)
    private UUID resourceId;

    @Column(name = "from_branch_id", nullable = false)
    private UUID fromBranchId;

    @Column(name = "to_branch_id", nullable = false)
    private UUID toBranchId;

    @Column(name = "transfer_date", nullable = false)
    private LocalDate transferDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "approved_by")
    private UUID approvedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (id == null) id = UUID.randomUUID();
    }

    public enum ResourceType {
        VEHICLE, DRIVER, EQUIPMENT
    }
}
