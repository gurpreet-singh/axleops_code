package com.fleetmanagement.repository;

import com.fleetmanagement.entity.InvoiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceTypeRepository extends JpaRepository<InvoiceType, UUID> {
    List<InvoiceType> findByTenantId(UUID tenantId);
    Optional<InvoiceType> findByIdAndTenantId(UUID id, UUID tenantId);
    Optional<InvoiceType> findByNameIgnoreCaseAndTenantId(String name, UUID tenantId);
}
