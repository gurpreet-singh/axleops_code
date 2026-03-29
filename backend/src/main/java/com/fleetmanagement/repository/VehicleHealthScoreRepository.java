package com.fleetmanagement.repository;

import com.fleetmanagement.entity.VehicleHealthScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleHealthScoreRepository extends JpaRepository<VehicleHealthScore, UUID> {
    Optional<VehicleHealthScore> findFirstByVehicleIdAndTenantIdOrderByCalculatedAtDesc(UUID vehicleId, UUID tenantId);
}
