package com.fleetmanagement.repository;

import com.fleetmanagement.entity.TripAdvance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripAdvanceRepository extends JpaRepository<TripAdvance, UUID> {
    List<TripAdvance> findByTripIdAndTenantIdOrderByGivenDateDesc(UUID tripId, UUID tenantId);

    @Query("SELECT COALESCE(SUM(a.amount), 0) FROM TripAdvance a WHERE a.tripId = ?1 AND a.tenantId = ?2")
    BigDecimal sumByTripIdAndTenantId(UUID tripId, UUID tenantId);
}
