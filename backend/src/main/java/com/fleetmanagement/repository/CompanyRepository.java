package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    List<Company> findByTenantId(UUID tenantId);

    List<Company> findByTenantIdAndCompanyType(UUID tenantId, Company.CompanyType companyType);

    Optional<Company> findByIdAndTenantId(UUID id, UUID tenantId);

    /**
     * Find by PAN — tenant-scoped to prevent cross-tenant lookups.
     */
    Optional<Company> findByPanNumberAndTenantId(String panNumber, UUID tenantId);
}
