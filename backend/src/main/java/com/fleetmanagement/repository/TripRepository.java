package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Trip;
import com.fleetmanagement.entity.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {

    List<Trip> findByTenantId(UUID tenantId);
    Optional<Trip> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Trip> findByTenantIdAndStatus(UUID tenantId, TripStatus status);
    List<Trip> findByTenantIdAndStatusIn(UUID tenantId, Collection<TripStatus> statuses);
    Optional<Trip> findByTripNumberAndTenantId(String tripNumber, UUID tenantId);
    long countByTenantIdAndStatus(UUID tenantId, TripStatus status);

    // ─── Branch-scoped queries ──────────────────────────────────
    List<Trip> findByTenantIdAndBranchId(UUID tenantId, UUID branchId);

    // ─── Branch deactivation guard ──────────────────────────────
    long countByBranchIdAndStatusIn(UUID branchId, Collection<TripStatus> statuses);

    // ─── Vehicle/Driver queries ─────────────────────────────────
    List<Trip> findByVehicleIdAndTenantIdOrderByCreatedAtDesc(UUID vehicleId, UUID tenantId);
    long countByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
    long countByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, TripStatus status);
}
