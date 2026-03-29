package com.fleetmanagement.repository;

import com.fleetmanagement.entity.ImportAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ImportAuditLogRepository extends JpaRepository<ImportAuditLog, UUID> {

    List<ImportAuditLog> findByTenantIdOrderByStartedAtDesc(UUID tenantId);

    List<ImportAuditLog> findByTenantIdAndEntityNameOrderByStartedAtDesc(UUID tenantId, String entityName);
}
