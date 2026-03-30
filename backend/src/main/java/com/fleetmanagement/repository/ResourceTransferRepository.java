package com.fleetmanagement.repository;

import com.fleetmanagement.entity.ResourceTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceTransferRepository extends JpaRepository<ResourceTransfer, UUID> {

    List<ResourceTransfer> findByTenantIdAndResourceIdOrderByCreatedAtDesc(UUID tenantId, UUID resourceId);

    List<ResourceTransfer> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
