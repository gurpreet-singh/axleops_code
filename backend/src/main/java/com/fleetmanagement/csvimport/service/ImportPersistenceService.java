package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.*;
import com.fleetmanagement.config.TenantContext;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    public ImportPersistenceService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    /**
     * Persist all valid/non-duplicate rows in batches.
     * Returns the number of successfully imported rows.
     */
    @Transactional
    public ImportResult persist(List<ValidatedRow> validatedRows, ImportEntityConfig config,
                                DuplicateStrategy duplicateStrategy) {
        UUID tenantId = TenantContext.get();

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
                Object entity = createEntityInstance(row.getData(), config, tenantId);
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

    private Object createEntityInstance(Map<String, String> data, ImportEntityConfig config, UUID tenantId) {
        try {
            Object entity = config.getEntityClass().getDeclaredConstructor().newInstance();

            // Set tenantId
            setFieldValue(entity, "tenantId", tenantId);

            // Set each mapped field
            for (ImportFieldDefinition fieldDef : config.getFields()) {
                String value = data.get(fieldDef.getFieldName());
                if (value == null || value.trim().isEmpty()) continue;

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

    private Object convertValue(String value, ImportFieldDefinition fieldDef, Class<?> entityClass) {
        if (value == null || value.trim().isEmpty()) return null;
        String trimmed = value.trim();

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
            case INTEGER -> Integer.parseInt(cleanNumeric(trimmed));
            case LONG -> Long.parseLong(cleanNumeric(trimmed));
            case DOUBLE -> Double.parseDouble(cleanNumeric(trimmed));
            case BOOLEAN -> parseBoolean(trimmed);
            case DATE -> parseDate(trimmed, fieldDef.getDateFormat());
            case ENUM -> trimmed.toUpperCase();
        };
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
        return value.replaceAll(",", "");
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
