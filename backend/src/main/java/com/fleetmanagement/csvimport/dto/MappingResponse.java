package com.fleetmanagement.csvimport.dto;

import com.fleetmanagement.csvimport.model.FieldError;
import com.fleetmanagement.csvimport.model.RowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MappingResponse {
    private int validCount;
    private int errorCount;
    private int duplicateCount;
    private int totalCount;
    private List<RowResult> validRows;
    private List<RowResult> errorRows;
    private List<RowResult> duplicateRows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RowResult {
        private int rowNumber;
        private Map<String, String> data;
        private RowStatus status;
        private List<FieldError> errors;
        private String duplicateReason;
    }
}
