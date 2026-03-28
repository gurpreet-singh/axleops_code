package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByTenantId(UUID tenantId);
    Optional<Vehicle> findByIdAndTenantId(UUID id, UUID tenantId);
}
