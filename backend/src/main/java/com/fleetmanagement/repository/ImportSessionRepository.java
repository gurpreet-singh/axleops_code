package com.fleetmanagement.repository;

import com.fleetmanagement.csvimport.model.ImportSessionStatus;
import com.fleetmanagement.entity.ImportSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImportSessionRepository extends JpaRepository<ImportSession, UUID> {

    Optional<ImportSession> findByIdAndTenantId(UUID id, UUID tenantId);

    List<ImportSession> findByTenantIdAndStatus(UUID tenantId, ImportSessionStatus status);

    List<ImportSession> findByExpiresAtBefore(LocalDateTime cutoff);
}
