package com.fleetmanagement.repository;

import com.fleetmanagement.entity.FuelEntry;
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
public interface FuelEntryRepository extends JpaRepository<FuelEntry, UUID> {
    List<FuelEntry> findByTenantId(UUID tenantId);
    Optional<FuelEntry> findByIdAndTenantId(UUID id, UUID tenantId);
    List<FuelEntry> findByVehicleIdAndTenantIdOrderByFillDateDesc(UUID vehicleId, UUID tenantId);

    @Query("SELECT COALESCE(SUM(f.quantityLitres), 0) FROM FuelEntry f WHERE f.vehicle.id = :vid AND f.tenantId = :tid")
    BigDecimal sumLitresByVehicle(@Param("vid") UUID vehicleId, @Param("tid") UUID tenantId);

    @Query("SELECT COALESCE(SUM(f.totalCost), 0) FROM FuelEntry f WHERE f.vehicle.id = :vid AND f.tenantId = :tid")
    BigDecimal sumCostByVehicle(@Param("vid") UUID vehicleId, @Param("tid") UUID tenantId);

    @Query("SELECT COALESCE(AVG(f.mileageKmpl), 0) FROM FuelEntry f WHERE f.vehicle.id = :vid AND f.tenantId = :tid AND f.mileageKmpl IS NOT NULL")
    BigDecimal avgMileageByVehicle(@Param("vid") UUID vehicleId, @Param("tid") UUID tenantId);

    @Query("SELECT COALESCE(SUM(f.totalCost), 0) FROM FuelEntry f WHERE f.vehicle.id = :vid AND f.tenantId = :tid AND f.fillDate >= :from")
    BigDecimal sumCostSince(@Param("vid") UUID vehicleId, @Param("tid") UUID tenantId, @Param("from") LocalDate from);

    Optional<FuelEntry> findFirstByVehicleIdAndTenantIdOrderByFillDateDesc(UUID vehicleId, UUID tenantId);
}
