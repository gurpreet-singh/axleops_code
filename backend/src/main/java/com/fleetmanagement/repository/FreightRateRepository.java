package com.fleetmanagement.repository;

import com.fleetmanagement.entity.FreightRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FreightRateRepository extends JpaRepository<FreightRate, UUID> {

    List<FreightRate> findByCompanyIdAndTenantId(UUID companyId, UUID tenantId);

    List<FreightRate> findByCompanyIdAndOriginAndDestinationAndTenantId(
            UUID companyId, String origin, String destination, UUID tenantId);

    List<FreightRate> findByTenantId(UUID tenantId);
}
