package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerRepository extends JpaRepository<Ledger, UUID> {

    List<Ledger> findByTenantId(UUID tenantId);

    Optional<Ledger> findByIdAndTenantId(UUID id, UUID tenantId);
}