package com.fleetmanagement.repository;

import com.fleetmanagement.entity.DriverAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverAssignmentRepository extends JpaRepository<DriverAssignment, UUID> {
    List<DriverAssignment> findByVehicleIdAndTenantIdOrderByAssignedFromDesc(UUID vehicleId, UUID tenantId);
    Optional<DriverAssignment> findByVehicleIdAndTenantIdAndIsCurrentTrue(UUID vehicleId, UUID tenantId);
    Optional<DriverAssignment> findByIdAndTenantId(UUID id, UUID tenantId);
    List<DriverAssignment> findByDriverIdAndTenantIdOrderByAssignedFromDesc(UUID driverId, UUID tenantId);
}
