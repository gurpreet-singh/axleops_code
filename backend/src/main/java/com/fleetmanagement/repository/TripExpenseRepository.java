package com.fleetmanagement.repository;

import com.fleetmanagement.entity.TripExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripExpenseRepository extends JpaRepository<TripExpense, UUID> {
    List<TripExpense> findByTripIdAndTenantIdOrderByExpenseDateDesc(UUID tripId, UUID tenantId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM TripExpense e WHERE e.tripId = ?1 AND e.tenantId = ?2")
    BigDecimal sumByTripIdAndTenantId(UUID tripId, UUID tenantId);
}
