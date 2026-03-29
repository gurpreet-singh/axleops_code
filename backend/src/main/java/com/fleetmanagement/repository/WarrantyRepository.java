package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, UUID> {
    List<Warranty> findByTenantId(UUID tenantId);
    Optional<Warranty> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Warranty> findByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
    List<Warranty> findByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, String status);
}
