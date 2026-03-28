package com.fleetmanagement.repository;

import com.fleetmanagement.entity.LedgerAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerAccountRepository extends JpaRepository<LedgerAccount, UUID> {

    List<LedgerAccount> findByTenantIdAndActiveTrue(UUID tenantId);

    List<LedgerAccount> findByTenantId(UUID tenantId);

    List<LedgerAccount> findByCompanyId(UUID companyId);

    List<LedgerAccount> findByAccountSubType(LedgerAccount.AccountSubType accountSubType);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.active = true AND la.accountSubType = :subType")
    List<LedgerAccount> findActiveBySubType(@Param("tenantId") UUID tenantId, @Param("subType") LedgerAccount.AccountSubType subType);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.groupNature = :nature AND la.active = true")
    List<LedgerAccount> findByGroupNature(@Param("tenantId") UUID tenantId, @Param("nature") String nature);

    /**
     * Cascade update: when Company master data changes, propagate to all LedgerAccount rows.
     */
    @Modifying
    @Query("UPDATE LedgerAccount la SET la.legalName = :legalName, la.panNumber = :panNumber WHERE la.company.id = :companyId")
    int cascadeCompanyUpdate(@Param("companyId") UUID companyId, @Param("legalName") String legalName, @Param("panNumber") String panNumber);
}
