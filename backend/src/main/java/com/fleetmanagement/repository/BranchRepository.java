package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {

    List<Branch> findByTenantId(UUID tenantId);

    List<Branch> findByTenantIdAndActiveTrue(UUID tenantId);

    Optional<Branch> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<Branch> findByTenantIdAndCodeAndActiveTrue(UUID tenantId, String code);

    Optional<Branch> findByTenantIdAndHeadquartersTrue(UUID tenantId);

    boolean existsByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);

    boolean existsByTenantIdAndName(UUID tenantId, String name);

    long countByTenantIdAndActiveTrue(UUID tenantId);

    List<Branch> findByTenantIdAndActiveTrueOrderBySortOrderAsc(UUID tenantId);
}