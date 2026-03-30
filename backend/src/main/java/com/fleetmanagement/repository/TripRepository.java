package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    // ─── Tenant-wide queries ────────────────────────────────────
    List<Trip> findByTenantId(UUID tenantId);
    Optional<Trip> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Trip> findByVehicleIdAndTenantIdOrderByScheduledStartDesc(UUID vehicleId, UUID tenantId);
    long countByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
    long countByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, String status);

    // ─── Branch-scoped queries ──────────────────────────────────
    List<Trip> findByTenantIdAndBranchId(UUID tenantId, UUID branchId);

    // ─── Branch deactivation guard ──────────────────────────────
    long countByBranchIdAndStatusIn(UUID branchId, Collection<String> statuses);
}
