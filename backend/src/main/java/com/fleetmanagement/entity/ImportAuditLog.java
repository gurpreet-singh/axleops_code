package com.fleetmanagement.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Audit log for every import operation.
 */
@Entity
@Table(name = "import_audit_logs")
@Getter
@Setter
public class ImportAuditLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "entity_name", nullable = false, length = 50)
    private String entityName;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "imported_rows")
    private Integer importedRows = 0;

    @Column(name = "error_rows")
    private Integer errorRows = 0;

    @Column(name = "duplicate_rows")
    private Integer duplicateRows = 0;

    @Column(name = "overwritten_rows")
    private Integer overwrittenRows = 0;

    @Column(name = "duplicate_strategy", length = 20)
    private String duplicateStrategy;

    /** Snapshot of the column mapping used. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mapping_snapshot", columnDefinition = "jsonb")
    private Map<String, String> mappingSnapshot;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // COMPLETED, PARTIAL, FAILED

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "imported_by", nullable = false, length = 50)
    private String importedBy;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    void onCreate() {
        if (startedAt == null) startedAt = LocalDateTime.now();
    }
}
