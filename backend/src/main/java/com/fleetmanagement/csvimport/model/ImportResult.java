package com.fleetmanagement.csvimport.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {
    @Builder.Default
    private int totalRows = 0;
    @Builder.Default
    private int importedRows = 0;
    @Builder.Default
    private int errorRows = 0;
    @Builder.Default
    private int duplicateRows = 0;
    @Builder.Default
    private int overwrittenRows = 0;
    @Builder.Default
    private int skippedRows = 0;
}
