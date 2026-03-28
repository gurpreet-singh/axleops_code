package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Tenant User — an employee of a transport company.
 * Each user belongs to exactly one tenant and can hold multiple roles.
 * Effective authorities are the union of all authorities from all assigned roles.
 */
@Entity
@Table(name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "email"}))
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String password;

    private String title;
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    // ─── RBAC: Multi-role assignment via join table ──────────
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "tenant_user_role",
        joinColumns = @JoinColumn(name = "user_id")
    )
    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private Set<Role> roles = EnumSet.noneOf(Role.class);

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

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

    // ─── Computed: flatten authorities from all roles ────────

    /**
     * Returns the union of all authorities from all assigned roles.
     */
    public Set<Authority> getEffectiveAuthorities() {
        return roles.stream()
            .flatMap(role -> role.getAuthorities().stream())
            .collect(Collectors.toCollection(() -> EnumSet.noneOf(Authority.class)));
    }

    /**
     * Check if this user has a specific authority (across all roles).
     */
    public boolean hasAuthority(Authority authority) {
        return roles.stream()
            .anyMatch(role -> role.getAuthorities().contains(authority));
    }

    /**
     * Convenience: full display name.
     */
    public String getFullName() {
        if (lastName == null || lastName.isBlank()) return firstName;
        return firstName + " " + lastName;
    }
}
