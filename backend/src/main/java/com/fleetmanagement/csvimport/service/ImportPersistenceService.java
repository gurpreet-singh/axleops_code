package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.*;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.repository.BranchRepository;
import com.fleetmanagement.service.BranchValidator;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;

import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Stage 6: PERSISTENCE
 * Batch inserts validated rows into the database using JPA.
 */
@Service
public class ImportPersistenceService {

    private static final Logger log = LoggerFactory.getLogger(ImportPersistenceService.class);
    private static final int BATCH_SIZE = 500;

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("d-M-yyyy")
    );

    private final EntityManager entityManager;
    private final BranchValidator branchValidator;
    private final BranchRepository branchRepository;

    public ImportPersistenceService(EntityManager entityManager,
                                    BranchValidator branchValidator,
                                    BranchRepository branchRepository) {
        this.entityManager = entityManager;
        this.branchValidator = branchValidator;
        this.branchRepository = branchRepository;
    }

    /**
     * Persist all valid/non-duplicate rows in batches.
     * Returns the number of successfully imported rows.
     */
    @Transactional
    public ImportResult persist(List<ValidatedRow> validatedRows, ImportEntityConfig config,
                                DuplicateStrategy duplicateStrategy) {
        UUID tenantId = TenantContext.get();

        // Resolve branch from the logged-in user's context
        Branch resolvedBranch = resolveBranchFromPrincipal(tenantId);

        List<ValidatedRow> toImport = validatedRows.stream()
                .filter(r -> r.getStatus() == RowStatus.VALID)
                .toList();

        List<ValidatedRow> duplicatesToOverwrite = new ArrayList<>();
        if (duplicateStrategy == DuplicateStrategy.OVERWRITE) {
            duplicatesToOverwrite = validatedRows.stream()
                    .filter(r -> r.getStatus() == RowStatus.DUPLICATE)
                    .filter(r -> {
                        DuplicateStrategy perRow = r.getPerRowDuplicateStrategy();
                        return perRow == null || perRow == DuplicateStrategy.OVERWRITE;
                    })
                    .toList();
        } else if (duplicateStrategy == DuplicateStrategy.KEEP_BOTH) {
            List<ValidatedRow> keepBoth = validatedRows.stream()
                    .filter(r -> r.getStatus() == RowStatus.DUPLICATE)
                    .filter(r -> {
                        DuplicateStrategy perRow = r.getPerRowDuplicateStrategy();
                        return perRow == null || perRow == DuplicateStrategy.KEEP_BOTH;
                    })
                    .toList();
            toImport = new ArrayList<>(toImport);
            ((ArrayList<ValidatedRow>) toImport).addAll(keepBoth);
        }

        int imported = 0;
        int overwritten = 0;

        // Batch insert valid rows
        List<Object> batch = new ArrayList<>();
        for (ValidatedRow row : toImport) {
            try {
                Object entity = createEntityInstance(row.getData(), config, tenantId, resolvedBranch);
                batch.add(entity);

                if (batch.size() >= BATCH_SIZE) {
                    flushBatch(batch);
                    imported += batch.size();
                    batch.clear();
                }
            } catch (Exception e) {
                log.warn("Failed to create entity for row {}: {}", row.getRowNumber(), e.getMessage());
            }
        }
        if (!batch.isEmpty()) {
            flushBatch(batch);
            imported += batch.size();
        }

        // Handle overwrites
        for (ValidatedRow row : duplicatesToOverwrite) {
            try {
                // For overwrites: find existing and update
                if (updateExistingRecord(row, config, tenantId)) {
                    overwritten++;
                }
            } catch (Exception e) {
                log.warn("Failed to overwrite record for row {}: {}", row.getRowNumber(), e.getMessage());
            }
        }

        int errorRows = (int) validatedRows.stream().filter(ValidatedRow::isInvalid).count();
        int duplicateSkipped = (int) validatedRows.stream()
                .filter(ValidatedRow::isDuplicate)
                .filter(r -> {
                    DuplicateStrategy perRow = r.getPerRowDuplicateStrategy();
                    if (duplicateStrategy == DuplicateStrategy.SKIP) {
                        return perRow == null || perRow == DuplicateStrategy.SKIP;
                    }
                    return false;
                })
                .count();

        ImportResult result = ImportResult.builder()
                .totalRows(validatedRows.size())
                .importedRows(imported)
                .errorRows(errorRows)
                .duplicateRows((int) validatedRows.stream().filter(ValidatedRow::isDuplicate).count())
                .overwrittenRows(overwritten)
                .skippedRows(errorRows + duplicateSkipped)
                .build();

        log.info("Import persistence complete for {}: {}", config.getEntityName(), result);
        return result;
    }

    private void flushBatch(List<Object> batch) {
        for (Object entity : batch) {
            entityManager.persist(entity);
        }
        entityManager.flush();
        entityManager.clear();
    }

    private Object createEntityInstance(Map<String, String> data, ImportEntityConfig config,
                                        UUID tenantId, Branch branch) {
        try {
            Object entity = config.getEntityClass().getDeclaredConstructor().newInstance();

            // Set tenantId
            setFieldValue(entity, "tenantId", tenantId);

            // Set branch if the entity has a branch field
            if (branch != null && findField(config.getEntityClass(), "branch") != null) {
                setFieldValue(entity, "branch", branch);
            }

            // Set each mapped field
            for (ImportFieldDefinition fieldDef : config.getFields()) {
                String value = data.get(fieldDef.getFieldName());
                if (value == null || value.trim().isEmpty()) continue;

                // FK resolution: look up linked entity by name (tenant-scoped)
                if (fieldDef.getForeignKeyEntity() != null && fieldDef.getForeignKeyLookupField() != null) {
                    Object fkEntity = resolveForeignKey(
                            fieldDef.getForeignKeyEntity(),
                            fieldDef.getForeignKeyLookupField(),
                            value.trim(), tenantId);
                    if (fkEntity != null) {
                        setFieldValue(entity, fieldDef.getFieldName(), fkEntity);
                    } else {
                        log.warn("FK lookup failed for {}='{}' — no matching {} found for tenant",
                                fieldDef.getFieldName(), value.trim(), fieldDef.getForeignKeyEntity());
                    }
                    continue;
                }

                Object convertedValue = convertValue(value, fieldDef, config.getEntityClass());
                if (convertedValue != null) {
                    setFieldValue(entity, fieldDef.getFieldName(), convertedValue);
                }
            }

            return entity;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create entity: " + e.getMessage(), e);
        }
    }

    /**
     * Resolves the branch from the current logged-in user's TenantPrincipal.
     * Uses BranchValidator.resolve() which handles:
     * - Branch-scoped user → their branch
     * - Tenant-wide user with single branch → auto-assign
     * - Tenant-wide user with multi-branch → error (must specify)
     */
    private Branch resolveBranchFromPrincipal(UUID tenantId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof TenantPrincipal tp) {
                UUID branchId = branchValidator.resolve(tp, null);
                return branchRepository.findById(branchId).orElse(null);
            }
        } catch (Exception e) {
            log.warn("Could not resolve branch for import: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Generic FK resolution: find an entity by a lookup field, always scoped to tenantId.
     * Uses JPQL: SELECT e FROM {Entity} e WHERE LOWER(e.{lookupField}) = :val AND e.tenantId = :tenantId
     */
    private Object resolveForeignKey(String entityName, String lookupField, String lookupValue, UUID tenantId) {
        try {
            String jpql = "SELECT e FROM " + entityName + " e WHERE LOWER(e." + lookupField + ") = :val AND e.tenantId = :tenantId";
            @SuppressWarnings("unchecked")
            List<Object> results = entityManager.createQuery(jpql)
                    .setParameter("val", lookupValue.toLowerCase())
                    .setParameter("tenantId", tenantId)
                    .getResultList();
            return results.isEmpty() ? null : results.get(0);
        } catch (Exception e) {
            log.warn("FK resolution error for {}.{}: {}", entityName, lookupField, e.getMessage());
            return null;
        }
    }

    private Object convertValue(String value, ImportFieldDefinition fieldDef, Class<?> entityClass) {
        String trimmed = (value == null) ? "" : value.trim();

        // Treat common null-like placeholders as empty across ALL types
        if (isEffectivelyNull(trimmed)) {
            return null;
        }

        // Check the actual field type on the entity to handle enums properly
        try {
            Field entityField = findField(entityClass, fieldDef.getFieldName());
            if (entityField != null && entityField.getType().isEnum()) {
                @SuppressWarnings({"unchecked", "rawtypes"})
                Object enumVal = Enum.valueOf((Class<Enum>) entityField.getType(), trimmed.toUpperCase());
                return enumVal;
            }
        } catch (Exception ignored) {}

        return switch (fieldDef.getDataType()) {
            case STRING, EMAIL, PHONE, PAN, GSTIN -> trimmed;
            case INTEGER -> {
                String clean = cleanNumeric(trimmed);
                yield clean.isEmpty() ? null : Integer.parseInt(clean);
            }
            case LONG -> {
                String clean = cleanNumeric(trimmed);
                yield clean.isEmpty() ? null : Long.parseLong(clean);
            }
            case DOUBLE -> {
                String clean = cleanNumeric(trimmed);
                yield clean.isEmpty() ? null : Double.parseDouble(clean);
            }
            case BOOLEAN -> parseBoolean(trimmed);
            case DATE -> parseDate(trimmed, fieldDef.getDateFormat());
            case ENUM -> trimmed.toUpperCase();
        };
    }

    /**
     * Detects whether a CSV cell value is effectively null/empty.
     * Handles all common representations of "no data" across CSV exports
     * from Excel, Google Sheets, Tally, SAP, and other systems.
     */
    private boolean isEffectivelyNull(String value) {
        if (value == null || value.isEmpty()) return true;
        String lower = value.trim().toLowerCase();
        return lower.isEmpty()
                || lower.equals("-")
                || lower.equals("--")
                || lower.equals("---")
                || lower.equals("na")
                || lower.equals("n/a")
                || lower.equals("n.a.")
                || lower.equals("n.a")
                || lower.equals("nil")
                || lower.equals("null")
                || lower.equals("none")
                || lower.equals("empty")
                || lower.equals("blank")
                || lower.equals(".")
                || lower.equals("..")
                || lower.equals("#n/a")
                || lower.equals("#na")
                || lower.equals("#value!")
                || lower.equals("#ref!")
                || lower.equals("#div/0!")
                || lower.equals("#null!")
                || lower.equals("not applicable")
                || lower.equals("not available")
                || lower.equals("undefined");
    }

    private Field findField(Class<?> clazz, String fieldName) {
        Class<?> current = clazz;
        while (current != null) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                current = current.getSuperclass();
            }
        }
        return null;
    }

    private void setFieldValue(Object entity, String fieldName, Object value) {
        try {
            Field field = findField(entity.getClass(), fieldName);
            if (field != null) {
                field.setAccessible(true);
                // Type conversion if needed
                if (field.getType() == BigDecimal.class && value instanceof Number) {
                    field.set(entity, BigDecimal.valueOf(((Number) value).doubleValue()));
                } else if (field.getType() == BigDecimal.class && value instanceof String) {
                    field.set(entity, new BigDecimal((String) value));
                } else {
                    field.set(entity, value);
                }
            }
        } catch (Exception e) {
            log.trace("Could not set field {} on {}: {}", fieldName, entity.getClass().getSimpleName(), e.getMessage());
        }
    }

    private String cleanNumeric(String value) {
        if (value == null) return "";
        if (isEffectivelyNull(value)) return "";

        String cleaned = value.trim()
                .replace("₹", "").replace("$", "").replace("€", "").replace("£", "")
                .replace("¥", "").replace("Rs.", "").replace("Rs", "").replace("INR", "")
                .replace("\u00A0", "")
                .replace("\u2012", "-").replace("\u2013", "-")
                .replace("\u2014", "-").replace("\u2015", "-")
                .replaceAll("[,\\s]", "")
                .trim();

        if (isEffectivelyNull(cleaned)) return "";
        if (cleaned.equals("+") || cleaned.equals("-")) return "";

        return cleaned;
    }

    private boolean parseBoolean(String value) {
        return Set.of("true", "yes", "1", "y").contains(value.toLowerCase());
    }

    private LocalDate parseDate(String value, String customFormat) {
        if (customFormat != null) {
            try {
                return LocalDate.parse(value, DateTimeFormatter.ofPattern(customFormat));
            } catch (DateTimeParseException ignored) {}
        }
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try {
                return LocalDate.parse(value, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        // Fallback: month-year formats (YYYY-MM, MM/YYYY, MM-YYYY, YYYY/MM)
        return tryParseMonthYear(value);
    }

    /**
     * Parse month-year strings like "YYYY-MM", "MM/YYYY", "MM-YYYY", "YYYY/MM".
     * Returns the 1st of that month as LocalDate, or null if unparseable.
     */
    private LocalDate tryParseMonthYear(String value) {
        if (value == null) return null;
        String v = value.trim();
        // YYYY-MM or YYYY/MM
        if (v.matches("\\d{4}[/\\-]\\d{1,2}")) {
            String[] parts = v.split("[/\\-]");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            if (month >= 1 && month <= 12 && year >= 1900 && year <= 2100)
                return LocalDate.of(year, month, 1);
        }
        // MM/YYYY or MM-YYYY
        if (v.matches("\\d{1,2}[/\\-]\\d{4}")) {
            String[] parts = v.split("[/\\-]");
            int month = Integer.parseInt(parts[0]);
            int year = Integer.parseInt(parts[1]);
            if (month >= 1 && month <= 12 && year >= 1900 && year <= 2100)
                return LocalDate.of(year, month, 1);
        }
        return null;
    }

    private boolean updateExistingRecord(ValidatedRow row, ImportEntityConfig config, UUID tenantId) {
        // Find existing record and update its fields
        List<String> checkFields = config.getDuplicateCheckFields();
        StringBuilder jpql = new StringBuilder("SELECT e FROM " + config.getEntityClass().getSimpleName() + " e WHERE e.tenantId = :tenantId");

        for (int i = 0; i < checkFields.size(); i++) {
            jpql.append(" AND LOWER(e.").append(checkFields.get(i)).append(") = :f").append(i);
        }

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("tenantId", tenantId);
        for (int i = 0; i < checkFields.size(); i++) {
            query.setParameter("f" + i, row.getData().getOrDefault(checkFields.get(i), "").toLowerCase());
        }

        @SuppressWarnings("unchecked")
        List<Object> results = query.getResultList();
        if (results.isEmpty()) return false;

        Object existing = results.get(0);
        for (ImportFieldDefinition fieldDef : config.getFields()) {
            String value = row.getData().get(fieldDef.getFieldName());
            if (value != null && !value.trim().isEmpty()) {
                // FK resolution for overwrites too
                if (fieldDef.getForeignKeyEntity() != null && fieldDef.getForeignKeyLookupField() != null) {
                    Object fkEntity = resolveForeignKey(
                            fieldDef.getForeignKeyEntity(),
                            fieldDef.getForeignKeyLookupField(),
                            value.trim(), tenantId);
                    if (fkEntity != null) {
                        setFieldValue(existing, fieldDef.getFieldName(), fkEntity);
                    }
                    continue;
                }
                Object converted = convertValue(value, fieldDef, config.getEntityClass());
                if (converted != null) {
                    setFieldValue(existing, fieldDef.getFieldName(), converted);
                }
            }
        }
        entityManager.merge(existing);
        return true;
    }
}
