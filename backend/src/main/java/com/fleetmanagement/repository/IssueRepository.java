package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Issue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IssueRepository extends JpaRepository<Issue, UUID> {
    List<Issue> findByTenantId(UUID tenantId);
    Optional<Issue> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Issue> findByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
    List<Issue> findByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, String status);
    long countByVehicleIdAndTenantIdAndStatusIn(UUID vehicleId, UUID tenantId, List<String> statuses);
    long countByTenantIdAndStatusIn(UUID tenantId, List<String> statuses);
}
