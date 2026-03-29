package com.fleetmanagement.repository;

import com.fleetmanagement.entity.ServiceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceTaskRepository extends JpaRepository<ServiceTask, UUID> {
    List<ServiceTask> findByTenantId(UUID tenantId);
    Optional<ServiceTask> findByIdAndTenantId(UUID id, UUID tenantId);
    List<ServiceTask> findByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
    List<ServiceTask> findByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, String status);
    long countByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, String status);
    List<ServiceTask> findByTenantIdAndNextDueDateBefore(UUID tenantId, LocalDate date);
}
