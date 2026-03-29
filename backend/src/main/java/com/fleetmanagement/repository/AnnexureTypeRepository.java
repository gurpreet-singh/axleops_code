package com.fleetmanagement.repository;

import com.fleetmanagement.entity.AnnexureType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AnnexureTypeRepository extends JpaRepository<AnnexureType, UUID> {
    List<AnnexureType> findByTenantId(UUID tenantId);
    Optional<AnnexureType> findByIdAndTenantId(UUID id, UUID tenantId);
    Optional<AnnexureType> findByNameIgnoreCaseAndTenantId(String name, UUID tenantId);
}
