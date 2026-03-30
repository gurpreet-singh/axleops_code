package com.fleetmanagement.entity.master;

import com.fleetmanagement.entity.MasterEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Vehicle Type master — categorises vehicles in the fleet.
 * Used in vehicle creation, freight rate cards, toll rates, trip creation.
 */
@Entity
@Table(name = "master_vehicle_types",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "code"}))
@Getter @Setter
public class VehicleTypeMaster extends MasterEntity {

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private VehicleCategory category;

    @Column(name = "num_wheels")
    private Integer numWheels;

    @Column(name = "num_axles")
    private Integer numAxles;

    @Column(name = "capacity_tons", precision = 10, scale = 2)
    private BigDecimal capacityTons;

    @Column(name = "capacity_volume_cft", precision = 10, scale = 2)
    private BigDecimal capacityVolumeCft;

    @Column(name = "fuel_tank_capacity_ltrs", precision = 10, scale = 2)
    private BigDecimal fuelTankCapacityLtrs;

    @Column(name = "expected_mileage_kmpl", precision = 8, scale = 2)
    private BigDecimal expectedMileageKmpl;

    @Column(name = "tare_weight_kg", precision = 10, scale = 2)
    private BigDecimal tareWeightKg;

    @Column(name = "length_ft", precision = 8, scale = 2)
    private BigDecimal lengthFt;
}
