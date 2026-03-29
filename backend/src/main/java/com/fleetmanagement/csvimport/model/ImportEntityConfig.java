package com.fleetmanagement.csvimport.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Describes an importable entity — its fields, duplicate-check strategy,
 * and optional hooks for pre/post-import logic.
 *
 * Each entity registers one of these into the {@link com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry}.
 * Adding a new importable entity = creating one config class, zero framework changes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportEntityConfig {

    /** Internal entity name, e.g. "LEDGER_GROUP". */
    private String entityName;

    /** UI display name, e.g. "Ledger Groups". */
    private String displayName;

    /** Help text shown in Step 1 entity selector. */
    private String description;

    /** Icon class (FontAwesome) for the entity card. */
    private String icon;

    /** JPA entity class for persistence. */
    private Class<?> entityClass;

    /** JPA repository class for DB operations. */
    private Class<?> repositoryClass;

    /** All importable fields. */
    @Builder.Default
    private List<ImportFieldDefinition> fields = new ArrayList<>();

    /** Max file size in bytes (default 10MB). */
    @Builder.Default
    private long maxFileSize = 10 * 1024 * 1024;

    /** Max rows per import (default 10,000). */
    @Builder.Default
    private int maxRowCount = 10_000;

    /** Fields used to detect duplicates against DB (e.g. ["groupName"]). */
    @Builder.Default
    private List<String> duplicateCheckFields = new ArrayList<>();

    /** If true, duplicate check is composite (all fields must match). If false, any field match = duplicate. */
    @Builder.Default
    private boolean duplicateCheckComposite = false;

    /** Optional: class name for custom pre-import business validation (cross-row logic). */
    private String preImportValidator;

    /** Optional: class name for post-import side effects. */
    private String postImportHook;

    /** Name of downloadable sample CSV. Auto-generated from fields if not set. */
    private String sampleCsvFileName;

    /**
     * Get a field definition by its fieldName.
     */
    public ImportFieldDefinition getField(String fieldName) {
        return fields.stream()
                .filter(f -> f.getFieldName().equals(fieldName))
                .findFirst()
                .orElse(null);
    }

    /**
     * Get all required fields.
     */
    public List<ImportFieldDefinition> getRequiredFields() {
        return fields.stream()
                .filter(ImportFieldDefinition::isRequired)
                .toList();
    }
}
