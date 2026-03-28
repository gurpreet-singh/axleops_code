package com.fleetmanagement.csvimport.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportEntityInfo {
    private String entityName;
    private String displayName;
    private String description;
    private String icon;
    private List<ImportFieldInfo> fields;
    private int requiredFieldCount;
    private int totalFieldCount;
}
