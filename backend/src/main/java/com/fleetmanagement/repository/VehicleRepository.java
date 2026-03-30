package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    // ─── Tenant-wide queries (for Owner/Super Admin) ────────────
    List<Vehicle> findByTenantId(UUID tenantId);

    Optional<Vehicle> findByIdAndTenantId(UUID id, UUID tenantId);

    List<Vehicle> findByTenantIdAndStatus(UUID tenantId, String status);

    List<Vehicle> findByTenantIdAndVehicleCategory(UUID tenantId, String category);

    Optional<Vehicle> findByRegistrationNumberAndTenantId(String registrationNumber, UUID tenantId);

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndStatus(UUID tenantId, String status);

    @Query("SELECT v FROM Vehicle v WHERE v.tenantId = :tid AND " +
           "(LOWER(v.registrationNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(v.make) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(v.model) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(v.chassisNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Vehicle> search(@Param("tid") UUID tenantId, @Param("q") String query);

    // ─── Branch-scoped queries (for Fleet Manager, Branch Manager) ──
    List<Vehicle> findByTenantIdAndBranchId(UUID tenantId, UUID branchId);

    long countByTenantIdAndBranchId(UUID tenantId, UUID branchId);

    long countByTenantIdAndBranchIdAndStatus(UUID tenantId, UUID branchId, String status);

    @Query("SELECT v FROM Vehicle v WHERE v.tenantId = :tid AND v.branch.id = :bid AND " +
           "(LOWER(v.registrationNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(v.make) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(v.model) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(v.chassisNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Vehicle> searchByBranch(@Param("tid") UUID tenantId, @Param("bid") UUID branchId, @Param("q") String query);

    // ─── Branch deactivation guard ──────────────────────────────
    long countByBranchIdAndStatus(UUID branchId, String status);
}
