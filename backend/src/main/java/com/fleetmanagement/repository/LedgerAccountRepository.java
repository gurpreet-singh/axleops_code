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

    List<LedgerAccount> findByAccountType(LedgerAccount.AccountType accountType);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.active = true AND la.accountType = :accountType")
    List<LedgerAccount> findActiveByType(@Param("tenantId") UUID tenantId, @Param("accountType") LedgerAccount.AccountType accountType);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.active = true AND la.pumpAccount = true")
    List<LedgerAccount> findFuelVendors(@Param("tenantId") UUID tenantId);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.company.id = :companyId AND la.originCity = :origin AND la.destinationCity = :dest AND la.accountType = 'PARTY_ROUTE' AND la.active = true")
    List<LedgerAccount> findRouteAccounts(@Param("tenantId") UUID tenantId, @Param("companyId") UUID companyId, @Param("origin") String origin, @Param("dest") String dest);

    @Query("SELECT la FROM LedgerAccount la WHERE la.tenantId = :tenantId AND la.groupNature = :nature AND la.active = true")
    List<LedgerAccount> findByGroupNature(@Param("tenantId") UUID tenantId, @Param("nature") String nature);

    /**
     * Cascade update: when Company master data changes, propagate to all LedgerAccount rows.
     * This is a rare write-time cost that eliminates constant read-time joins.
     */
    @Modifying
    @Query("UPDATE LedgerAccount la SET la.legalName = :legalName, la.panNumber = :panNumber WHERE la.company.id = :companyId")
    int cascadeCompanyUpdate(@Param("companyId") UUID companyId, @Param("legalName") String legalName, @Param("panNumber") String panNumber);
}
