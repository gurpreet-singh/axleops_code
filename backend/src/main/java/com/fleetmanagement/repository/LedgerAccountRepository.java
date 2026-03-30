package com.fleetmanagement.repository;

import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.LedgerAccountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LedgerAccountRepository extends JpaRepository<LedgerAccount, UUID> {

    List<LedgerAccount> findByTenantIdAndActiveTrue(UUID tenantId);

    List<LedgerAccount> findByTenantId(UUID tenantId);

    Optional<LedgerAccount> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<LedgerAccount> findByAccountHeadIgnoreCaseAndTenantId(String accountHead, UUID tenantId);

    /**
     * Find ledger accounts by company — tenant-scoped via the company's tenant ownership.
     * Callers MUST verify company belongs to the tenant before calling this.
     */
    List<LedgerAccount> findByCompanyIdAndTenantId(UUID companyId, UUID tenantId);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.active = true AND la.accountType = :accountType")
    List<LedgerAccount> findActiveByAccountType(@Param("tenantId") UUID tenantId, @Param("accountType") LedgerAccountType accountType);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.accountGroupRef.nature = :nature AND la.active = true")
    List<LedgerAccount> findByGroupNature(@Param("tenantId") UUID tenantId, @Param("nature") com.fleetmanagement.entity.LedgerGroup.GroupNature nature);

    /**
     * Cascade update: when Company master data changes, propagate to all LedgerAccount rows.
     * Tenant-scoped to prevent cross-tenant cascades.
     */
    @Modifying
    @Query("UPDATE LedgerAccount la SET la.legalName = :legalName, la.panNumber = :panNumber " +
           "WHERE la.company.id = :companyId AND la.tenantId = :tenantId")
    int cascadeCompanyUpdate(@Param("companyId") UUID companyId,
                             @Param("legalName") String legalName,
                             @Param("panNumber") String panNumber,
                             @Param("tenantId") UUID tenantId);
}
