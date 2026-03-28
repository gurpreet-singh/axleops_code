package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripRepository extends JpaRepository<Trip, UUID> {
    List<Trip> findByTenantId(UUID tenantId);
    Optional<Trip> findByIdAndTenantId(UUID id, UUID tenantId);
}
