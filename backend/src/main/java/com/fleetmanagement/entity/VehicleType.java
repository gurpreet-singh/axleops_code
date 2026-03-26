package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vehicle_types")
@Getter
@Setter
public class VehicleType {

    @Id
    @GeneratedValue
    private java.util.UUID id;

    @Column(nullable = false)
    private String name;

    private String category;

    @Column(name = "axle_count")
    private Integer axleCount;

    @Column(name = "payload_capacity")
    private java.math.BigDecimal payloadCapacity;

    @Column(name = "fuel_type")
    private String fuelType = "DIESEL";

    @Column(name = "tenant_id")
    private java.util.UUID tenantId;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
