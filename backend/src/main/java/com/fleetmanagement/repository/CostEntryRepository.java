package com.fleetmanagement.repository;

import com.fleetmanagement.entity.CostEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CostEntryRepository extends JpaRepository<CostEntry, UUID> {
    List<CostEntry> findByTenantId(UUID tenantId);
    Optional<CostEntry> findByIdAndTenantId(UUID id, UUID tenantId);
    List<CostEntry> findByVehicleIdAndTenantIdOrderByCostDateDesc(UUID vehicleId, UUID tenantId);
    List<CostEntry> findByVehicleIdAndTenantIdAndCostCategory(UUID vehicleId, UUID tenantId, String category);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CostEntry c WHERE c.vehicle.id = :vid AND c.tenantId = :tid")
    BigDecimal sumByVehicleAndTenant(@Param("vid") UUID vehicleId, @Param("tid") UUID tenantId);

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CostEntry c WHERE c.vehicle.id = :vid AND c.tenantId = :tid AND c.costDate >= :from")
    BigDecimal sumByVehicleAndTenantSince(@Param("vid") UUID vehicleId, @Param("tid") UUID tenantId, @Param("from") LocalDate from);
}
