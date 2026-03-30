package com.fleetmanagement.repository;

import com.fleetmanagement.entity.TripSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripSettlementRepository extends JpaRepository<TripSettlement, UUID> {
    Optional<TripSettlement> findByTripIdAndTenantId(UUID tripId, UUID tenantId);
}
