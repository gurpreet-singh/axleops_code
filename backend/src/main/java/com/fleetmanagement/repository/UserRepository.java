package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Role;
import com.fleetmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // ─── Core lookups ────────────────────────────────────────────
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameAndTenantId(String username, UUID tenantId);
    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);

    // ─── Tenant-wide queries ─────────────────────────────────────
    List<User> findByTenantId(UUID tenantId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.tenantId = :tenantId AND r = :role")
    List<User> findByTenantIdAndRole(@Param("tenantId") UUID tenantId, @Param("role") Role role);

    // ─── Branch-scoped queries ───────────────────────────────────
    List<User> findByTenantIdAndBranchId(UUID tenantId, UUID branchId);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE u.tenantId = :tenantId AND u.branch.id = :branchId AND r = :role")
    List<User> findByTenantIdAndBranchIdAndRole(@Param("tenantId") UUID tenantId, @Param("branchId") UUID branchId, @Param("role") Role role);

    // ─── Branch deactivation guard ───────────────────────────────
    long countByBranchIdAndStatus(UUID branchId, String status);
}