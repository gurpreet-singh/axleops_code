package com.fleetmanagement.csvimport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingTemplateResponse {
    private UUID id;
    private String templateName;
    private String entityName;
    private Map<String, String> mappings;
    private List<String> csvHeaders;
    private boolean isDefault;
    private int useCount;
    private LocalDateTime lastUsedAt;
    private String createdBy;
    private LocalDateTime createdAt;
}
