package com.fleetmanagement.repository;

import com.fleetmanagement.entity.ImportMappingTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ImportMappingTemplateRepository extends JpaRepository<ImportMappingTemplate, UUID> {

    List<ImportMappingTemplate> findByTenantIdAndEntityNameOrderByLastUsedAtDesc(UUID tenantId, String entityName);

    Optional<ImportMappingTemplate> findByTenantIdAndEntityNameAndIsDefaultTrue(UUID tenantId, String entityName);

    Optional<ImportMappingTemplate> findByIdAndTenantId(UUID id, UUID tenantId);

    Optional<ImportMappingTemplate> findByTenantIdAndEntityNameAndTemplateName(UUID tenantId, String entityName, String templateName);
}
