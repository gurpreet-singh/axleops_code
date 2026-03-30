package com.fleetmanagement.repository.master;

import com.fleetmanagement.entity.MasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Base repository for all master entities — provides tenant-scoped queries.
 */
@NoRepositoryBean
public interface MasterEntityRepository<T extends MasterEntity> extends JpaRepository<T, UUID> {

    List<T> findByTenantIdAndActiveOrderBySortOrderAscNameAsc(UUID tenantId, boolean active);

    List<T> findByTenantIdOrderBySortOrderAscNameAsc(UUID tenantId);

    Optional<T> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<T> findByCodeAndTenantId(String code, UUID tenantId);

    Optional<T> findByNameIgnoreCaseAndTenantId(String name, UUID tenantId);

    List<T> findByTenantIdAndNameContainingIgnoreCaseOrderBySortOrderAsc(UUID tenantId, String name);

    long countByTenantId(UUID tenantId);

    long countByTenantIdAndActive(UUID tenantId, boolean active);
}
