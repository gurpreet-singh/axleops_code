package com.fleetmanagement.entity;

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
 * Saved mapping template — stores column mappings for repeat imports.
 * "Map once, import forever."
 */
@Entity
@Table(name = "import_mapping_templates",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "entity_name", "template_name"}))
@Getter
@Setter
public class ImportMappingTemplate {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "entity_name", nullable = false, length = 50)
    private String entityName;

    @Column(name = "template_name", nullable = false, length = 100)
    private String templateName;

    /** The actual mapping: { "CSV Header": "systemField", ... } */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mappings_json", columnDefinition = "jsonb", nullable = false)
    private Map<String, String> mappingsJson;

    /** Saved CSV headers — used for auto-detecting templates from future uploads. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "csv_headers", columnDefinition = "jsonb", nullable = false)
    private List<String> csvHeaders;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "use_count")
    private Integer useCount = 0;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (useCount == null) useCount = 0;
        if (isDefault == null) isDefault = false;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
