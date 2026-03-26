package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "branches")
@Getter
@Setter
public class Branch {

    @Id
    @GeneratedValue
    private java.util.UUID id;

    @Column(nullable = false)
    private String name;

    private String city;
    private String state;
    private String address;
    private String phone;
    private String email;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    private String status = "ACTIVE";

    @Column(name = "tenant_id")
    private java.util.UUID tenantId;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
