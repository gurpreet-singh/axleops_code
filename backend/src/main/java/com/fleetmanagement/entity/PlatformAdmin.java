package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Platform Admins are a separate concept from tenant Users.
 * They manage the AxleOps platform itself — creating tenants,
 * assigning system admins, etc. They are NOT tied to any tenant.
 */
@Entity
@Table(name = "platform_admins")
@Getter
@Setter
public class PlatformAdmin {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;
    private String phone;
    private String title = "Platform Administrator";

    @Column(name = "access_level")
    private String accessLevel = "FULL";

    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
