package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.*;
import com.fleetmanagement.config.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Stage 4: DUPLICATE DETECTION
 * Checks VALID rows against existing DB records and within the file itself.
 */
@Service
public class DuplicateDetectionService {

    private static final Logger log = LoggerFactory.getLogger(DuplicateDetectionService.class);

    private final EntityManager entityManager;

    public DuplicateDetectionService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Detect duplicates for all VALID rows. Marks matching rows as DUPLICATE.
     * Checks: (1) against DB, (2) within the file itself.
     */
    public List<ValidatedRow> detectDuplicates(
            List<ValidatedRow> validatedRows,
            ImportEntityConfig config) {

        if (config.getDuplicateCheckFields().isEmpty()) {
            return validatedRows;
        }

        UUID tenantId = TenantContext.get();
        List<String> checkFields = config.getDuplicateCheckFields();

        // Collect all values from VALID rows for batch DB query
        List<ValidatedRow> validRows = validatedRows.stream()
                .filter(ValidatedRow::isValid)
                .toList();

        if (validRows.isEmpty()) return validatedRows;

        // 1. Check against DB using batch queries
        detectDbDuplicates(validRows, config, tenantId, checkFields);

        // 2. Check within file (intra-file duplicates)
        detectIntraFileDuplicates(validRows, config, checkFields);

        long dupCount = validatedRows.stream().filter(ValidatedRow::isDuplicate).count();
        log.info("Duplicate detection for {}: {} duplicates found out of {} valid rows",
                config.getEntityName(), dupCount, validRows.size());

        return validatedRows;
    }

    private void detectDbDuplicates(List<ValidatedRow> validRows, ImportEntityConfig config,
                                     UUID tenantId, List<String> checkFields) {
        // Build a JPQL query to find existing records matching the check fields
        String entityClassName = config.getEntityClass().getSimpleName();

        if (config.isDuplicateCheckComposite()) {
            // Composite check: all fields must match
            detectDbDuplicatesComposite(validRows, entityClassName, tenantId, checkFields);
        } else {
            // Individual check: any field match = duplicate
            for (String fieldName : checkFields) {
                detectDbDuplicatesSingleField(validRows, entityClassName, tenantId, fieldName, config);
            }
        }
    }

    private void detectDbDuplicatesSingleField(List<ValidatedRow> validRows, String entityClassName,
                                                UUID tenantId, String fieldName, ImportEntityConfig config) {
        // Collect unique values for this field from valid (non-duplicate) rows
        List<String> values = validRows.stream()
                .filter(r -> r.getStatus() == RowStatus.VALID)
                .map(r -> r.getData().getOrDefault(fieldName, ""))
                .filter(v -> !v.isEmpty())
                .distinct()
                .toList();

        if (values.isEmpty()) return;

        // Batch query — find existing records
        String jpql = "SELECT e." + fieldName + " FROM " + entityClassName + " e WHERE e.tenantId = :tenantId AND LOWER(e." + fieldName + ") IN :values";
        try {
            List<String> lowerValues = values.stream().map(String::toLowerCase).toList();
            Query query = entityManager.createQuery(jpql);
            query.setParameter("tenantId", tenantId);
            query.setParameter("values", lowerValues);

            @SuppressWarnings("unchecked")
            List<Object> existingValues = query.getResultList();
            Set<String> existingLower = existingValues.stream()
                    .map(v -> v.toString().toLowerCase())
                    .collect(Collectors.toSet());

            ImportFieldDefinition fieldDef = config.getField(fieldName);
            String displayName = fieldDef != null ? fieldDef.getDisplayName() : fieldName;

            for (ValidatedRow row : validRows) {
                if (row.getStatus() != RowStatus.VALID) continue;
                String val = row.getData().getOrDefault(fieldName, "");
                if (!val.isEmpty() && existingLower.contains(val.toLowerCase())) {
                    row.setStatus(RowStatus.DUPLICATE);
                    row.setDuplicateReason(displayName + " '" + val + "' already exists in database");
                }
            }
        } catch (Exception e) {
            log.warn("Duplicate detection query failed for {}.{}: {}", entityClassName, fieldName, e.getMessage());
        }
    }

    private void detectDbDuplicatesComposite(List<ValidatedRow> validRows, String entityClassName,
                                              UUID tenantId, List<String> checkFields) {
        // For composite checks, we need to query per-row (batch when possible)
        for (ValidatedRow row : validRows) {
            if (row.getStatus() != RowStatus.VALID) continue;

            StringBuilder jpql = new StringBuilder("SELECT COUNT(e) FROM " + entityClassName + " e WHERE e.tenantId = :tenantId");
            Map<String, Object> params = new HashMap<>();
            params.put("tenantId", tenantId);

            boolean hasAllFields = true;
            for (int i = 0; i < checkFields.size(); i++) {
                String field = checkFields.get(i);
                String value = row.getData().getOrDefault(field, "");
                if (value.isEmpty()) {
                    hasAllFields = false;
                    break;
                }
                jpql.append(" AND LOWER(e.").append(field).append(") = :p").append(i);
                params.put("p" + i, value.toLowerCase());
            }

            if (!hasAllFields) continue;

            try {
                Query query = entityManager.createQuery(jpql.toString());
                params.forEach(query::setParameter);
                Long count = (Long) query.getSingleResult();

                if (count > 0) {
                    row.setStatus(RowStatus.DUPLICATE);
                    String reason = checkFields.stream()
                            .map(f -> f + "='" + row.getData().getOrDefault(f, "") + "'")
                            .collect(Collectors.joining(", "));
                    row.setDuplicateReason("Record with " + reason + " already exists in database");
                }
            } catch (Exception e) {
                log.warn("Composite duplicate check failed: {}", e.getMessage());
            }
        }
    }

    private void detectIntraFileDuplicates(List<ValidatedRow> validRows, ImportEntityConfig config, List<String> checkFields) {
        // Track seen combinations to detect intra-file duplicates
        Map<String, Integer> seenKeys = new HashMap<>();

        for (ValidatedRow row : validRows) {
            if (row.getStatus() != RowStatus.VALID) continue;

            String key = checkFields.stream()
                    .map(f -> row.getData().getOrDefault(f, "").toLowerCase())
                    .collect(Collectors.joining("|"));

            if (key.replaceAll("\\|", "").isEmpty()) continue;

            if (seenKeys.containsKey(key)) {
                row.setStatus(RowStatus.DUPLICATE);
                row.setDuplicateReason("Duplicate of row " + seenKeys.get(key) + " in this file");
            } else {
                seenKeys.put(key, row.getRowNumber());
            }
        }
    }
}
