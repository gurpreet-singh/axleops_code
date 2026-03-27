package com.fleetmanagement.repository;

import com.fleetmanagement.entity.AccountGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AccountGroupRepository extends JpaRepository<AccountGroup, UUID> {

    List<AccountGroup> findByTenantId(UUID tenantId);

    List<AccountGroup> findByTenantIdAndSystemGroupTrue(UUID tenantId);
}
