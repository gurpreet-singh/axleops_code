package com.fleetmanagement.repository;

import com.fleetmanagement.entity.VehicleDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleDocumentRepository extends JpaRepository<VehicleDocument, UUID> {
    List<VehicleDocument> findByVehicleIdAndTenantIdOrderByUploadDateDesc(UUID vehicleId, UUID tenantId);
    Optional<VehicleDocument> findByIdAndTenantId(UUID id, UUID tenantId);
    long countByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
}
