package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.entity.ImportMappingTemplate;
import com.fleetmanagement.repository.ImportMappingTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manages mapping templates — CRUD, auto-detection from CSV headers, and default management.
 * Core to the "map once, import forever" principle.
 */
@Service
@Transactional
public class MappingTemplateService {

    private static final Logger log = LoggerFactory.getLogger(MappingTemplateService.class);
    private static final double MATCH_THRESHOLD = 0.80;

    private final ImportMappingTemplateRepository templateRepository;

    public MappingTemplateService(ImportMappingTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    /**
     * Get all templates for an entity (current tenant).
     */
    public List<ImportMappingTemplate> getTemplates(String entityName) {
        return templateRepository.findByTenantIdAndEntityNameOrderByLastUsedAtDesc(
                TenantContext.get(), entityName);
    }

    /**
     * Save a new mapping template.
     */
    public ImportMappingTemplate saveTemplate(String entityName, String templateName,
                                               Map<String, String> mappings, List<String> csvHeaders,
                                               boolean setAsDefault, String createdBy) {
        UUID tenantId = TenantContext.get();

        // Check for duplicate name
        templateRepository.findByTenantIdAndEntityNameAndTemplateName(tenantId, entityName, templateName)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("A template named '" + templateName + "' already exists for " + entityName);
                });

        // If setting as default, un-default others
        if (setAsDefault) {
            clearDefaults(tenantId, entityName);
        }

        ImportMappingTemplate template = new ImportMappingTemplate();
        template.setTenantId(tenantId);
        template.setEntityName(entityName);
        template.setTemplateName(templateName);
        template.setMappingsJson(mappings);
        template.setCsvHeaders(csvHeaders);
        template.setIsDefault(setAsDefault);
        template.setUseCount(0);
        template.setCreatedBy(createdBy);

        template = templateRepository.save(template);
        log.info("Saved mapping template '{}' for entity {} (default={})", templateName, entityName, setAsDefault);
        return template;
    }

    /**
     * Update an existing template.
     */
    public ImportMappingTemplate updateTemplate(UUID templateId, String templateName,
                                                 Map<String, String> mappings, Boolean setAsDefault) {
        UUID tenantId = TenantContext.get();
        ImportMappingTemplate template = templateRepository.findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));

        if (templateName != null) template.setTemplateName(templateName);
        if (mappings != null) template.setMappingsJson(mappings);
        if (setAsDefault != null) {
            if (setAsDefault) clearDefaults(tenantId, template.getEntityName());
            template.setIsDefault(setAsDefault);
        }

        return templateRepository.save(template);
    }

    /**
     * Delete a template.
     */
    public void deleteTemplate(UUID templateId) {
        UUID tenantId = TenantContext.get();
        ImportMappingTemplate template = templateRepository.findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));
        templateRepository.delete(template);
        log.info("Deleted mapping template '{}'", template.getTemplateName());
    }

    /**
     * CRITICAL: Detect a matching template from uploaded CSV headers.
     * Called automatically after file upload (Step 2).
     *
     * Matching logic: if >= 80% of a template's csvHeaders match the uploaded headers
     * (case-insensitive, ignoring spaces/underscores), it's a match.
     *
     * Returns the best matching template (or null), plus all templates for the entity.
     */
    public TemplateDetectionResult detectTemplate(String entityName, List<String> uploadedHeaders) {
        UUID tenantId = TenantContext.get();
        List<ImportMappingTemplate> allTemplates = templateRepository
                .findByTenantIdAndEntityNameOrderByLastUsedAtDesc(tenantId, entityName);

        if (allTemplates.isEmpty()) {
            return new TemplateDetectionResult(null, 0, allTemplates);
        }

        Set<String> normalizedUploaded = uploadedHeaders.stream()
                .map(this::normalizeHeader)
                .collect(Collectors.toSet());

        ImportMappingTemplate bestMatch = null;
        double bestMatchPercentage = 0;

        for (ImportMappingTemplate template : allTemplates) {
            if (template.getCsvHeaders() == null || template.getCsvHeaders().isEmpty()) continue;

            long matchCount = template.getCsvHeaders().stream()
                    .map(this::normalizeHeader)
                    .filter(normalizedUploaded::contains)
                    .count();

            double matchPercentage = (double) matchCount / template.getCsvHeaders().size();

            if (matchPercentage >= MATCH_THRESHOLD && matchPercentage > bestMatchPercentage) {
                bestMatchPercentage = matchPercentage;
                bestMatch = template;
            }
        }

        // If no match above threshold, try the default template with any partial match
        if (bestMatch == null) {
            Optional<ImportMappingTemplate> defaultTemplate = allTemplates.stream()
                    .filter(t -> Boolean.TRUE.equals(t.getIsDefault()))
                    .findFirst();
            if (defaultTemplate.isPresent()) {
                ImportMappingTemplate dt = defaultTemplate.get();
                if (dt.getCsvHeaders() != null) {
                    long matchCount = dt.getCsvHeaders().stream()
                            .map(this::normalizeHeader)
                            .filter(normalizedUploaded::contains)
                            .count();
                    double matchPc = dt.getCsvHeaders().isEmpty() ? 0 :
                            (double) matchCount / dt.getCsvHeaders().size();
                    if (matchPc >= 0.5) {
                        bestMatch = dt;
                        bestMatchPercentage = matchPc;
                    }
                }
            }
        }

        if (bestMatch != null) {
            log.info("Template '{}' matched with {:.0f}% header overlap for entity {}",
                    bestMatch.getTemplateName(), bestMatchPercentage * 100, entityName);
        }

        return new TemplateDetectionResult(bestMatch, bestMatchPercentage, allTemplates);
    }

    /**
     * Record template usage — increment use count and update last used time.
     */
    public void recordTemplateUsage(UUID templateId) {
        UUID tenantId = TenantContext.get();
        templateRepository.findByIdAndTenantId(templateId, tenantId).ifPresent(template -> {
            template.setUseCount(template.getUseCount() + 1);
            template.setLastUsedAt(LocalDateTime.now());
            templateRepository.save(template);
        });
    }

    private void clearDefaults(UUID tenantId, String entityName) {
        templateRepository.findByTenantIdAndEntityNameAndIsDefaultTrue(tenantId, entityName)
                .ifPresent(existing -> {
                    existing.setIsDefault(false);
                    templateRepository.save(existing);
                });
    }

    private String normalizeHeader(String header) {
        return header.toLowerCase()
                .replaceAll("[\\s_\\-]+", "")
                .trim();
    }

    /**
     * Result of template detection.
     */
    public record TemplateDetectionResult(
            ImportMappingTemplate matchedTemplate,
            double matchPercentage,
            List<ImportMappingTemplate> allTemplates
    ) {}
}
