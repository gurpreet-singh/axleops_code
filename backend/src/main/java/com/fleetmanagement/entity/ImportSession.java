package com.fleetmanagement.entity;

import com.fleetmanagement.csvimport.model.ImportSessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Persisted import session — tracks the full lifecycle of one CSV import.
 * Stores parsed data, mappings, validation results, etc.
 */
@Entity
@Table(name = "import_sessions")
@Getter
@Setter
public class ImportSession {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "entity_name", nullable = false, length = 50)
    private String entityName;

    @Column(name = "original_file_name")
    private String originalFileName;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    /** Original CSV headers from the uploaded file. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "csv_headers", columnDefinition = "jsonb")
    private List<String> csvHeaders;

    /** Raw CSV rows keyed by original CSV column headers. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_rows", columnDefinition = "jsonb")
    private List<Map<String, String>> rawRows;

    /** Rows re-keyed by system field names (after mapping). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mapped_rows", columnDefinition = "jsonb")
    private List<Map<String, String>> mappedRows;

    /** Column mapping: CSV header → system field name. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "column_mappings", columnDefinition = "jsonb")
    private Map<String, String> columnMappings;

    /** Validation results as serialized JSON. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validated_rows_json", columnDefinition = "jsonb")
    private String validatedRowsJson;

    @Column(name = "valid_count")
    private Integer validCount;

    @Column(name = "error_count")
    private Integer errorCount;

    @Column(name = "duplicate_count")
    private Integer duplicateCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ImportSessionStatus status;

    /** Import result counts (after execution). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "import_result_json", columnDefinition = "jsonb")
    private String importResultJson;

    /** Progress tracking for large imports. */
    @Column(name = "processed_rows")
    private Integer processedRows;

    @Column(name = "total_rows")
    private Integer totalRows;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
        if (expiresAt == null) expiresAt = LocalDateTime.now().plusMinutes(30);
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
