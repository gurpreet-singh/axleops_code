package com.fleetmanagement.csvimport.dto;

import com.fleetmanagement.csvimport.model.ImportResult;
import com.fleetmanagement.csvimport.model.ImportSessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportProgressResponse {
    private ImportSessionStatus status;
    private int processedRows;
    private int totalRows;
    private double percentComplete;
    private ImportResult result; // null until COMPLETED
}
