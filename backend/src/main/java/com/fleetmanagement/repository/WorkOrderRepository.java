package com.fleetmanagement.repository;

import com.fleetmanagement.entity.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, UUID> {
    List<WorkOrder> findByTenantId(UUID tenantId);
    Optional<WorkOrder> findByIdAndTenantId(UUID id, UUID tenantId);
}