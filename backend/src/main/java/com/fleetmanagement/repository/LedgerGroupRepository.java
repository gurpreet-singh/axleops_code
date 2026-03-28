package com.fleetmanagement.repository;

import com.fleetmanagement.entity.LedgerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerGroupRepository extends JpaRepository<LedgerGroup, UUID> {

    List<LedgerGroup> findByTenantId(UUID tenantId);
    Optional<LedgerGroup> findByIdAndTenantId(UUID id, UUID tenantId);
}
