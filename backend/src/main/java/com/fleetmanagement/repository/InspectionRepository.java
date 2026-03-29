package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, UUID> {
    List<Inspection> findByTenantId(UUID tenantId);
    Optional<Inspection> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Inspection> findByVehicleIdAndTenantIdOrderBySubmittedAtDesc(UUID vehicleId, UUID tenantId);
    long countByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
}
