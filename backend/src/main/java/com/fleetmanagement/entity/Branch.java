package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Branch — a physical location or organizational unit within a tenant.
 * Every tenant has at least one branch (auto-created HQ).
 * Branch is itself tenant-scoped (has tenant_id, NOT branch_id).
 */
@Entity
@Table(name = "branches",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"tenant_id", "code"}),
           @UniqueConstraint(columnNames = {"tenant_id", "name"})
       })
@Getter
@Setter
public class Branch {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(name = "state_code", length = 5)
    private String stateCode;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 15)
    private String gstin;

    @Column(name = "manager_id")
    private UUID managerId;

    @Column(name = "is_headquarters", nullable = false)
    private boolean headquarters = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (id == null) id = UUID.randomUUID();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
