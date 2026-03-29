package com.fleetmanagement.csvimport.dto;

import com.fleetmanagement.csvimport.model.ImportDataType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportFieldInfo {
    private String fieldName;
    private String displayName;
    private ImportDataType dataType;
    private boolean required;
    private Integer maxLength;
    private Double minValue;
    private Double maxValue;
    private String dateFormat;
    private List<String> enumValues;
    private String regexPattern;
    private boolean uniqueInDatabase;
    private String helpText;
    private String foreignKeyEntity;
}
