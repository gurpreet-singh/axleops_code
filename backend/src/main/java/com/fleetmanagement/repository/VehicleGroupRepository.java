package com.fleetmanagement.repository;

import com.fleetmanagement.entity.VehicleGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleGroupRepository extends JpaRepository<VehicleGroup, UUID> {

    List<VehicleGroup> findByTenantId(UUID tenantId);

    Optional<VehicleGroup> findByIdAndTenantId(UUID id, UUID tenantId);
}
