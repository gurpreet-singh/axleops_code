package com.fleetmanagement.csvimport.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidatedRow {
    private int rowNumber;

    /** System-field-keyed data (after column mapping). */
    @Builder.Default
    private Map<String, String> data = new LinkedHashMap<>();

    /** Original CSV-column-keyed data (preserved for error export). */
    @Builder.Default
    private Map<String, String> originalData = new LinkedHashMap<>();

    @Builder.Default
    private List<FieldError> errors = new ArrayList<>();

    @Builder.Default
    private RowStatus status = RowStatus.VALID;

    private String duplicateReason;

    /** If this row is a duplicate, the existing record's ID. */
    private UUID existingRecordId;

    /** Per-row duplicate strategy chosen by user (default null = use global strategy). */
    private DuplicateStrategy perRowDuplicateStrategy;

    public boolean isValid() {
        return status == RowStatus.VALID;
    }

    public boolean isDuplicate() {
        return status == RowStatus.DUPLICATE;
    }

    public boolean isInvalid() {
        return status == RowStatus.INVALID;
    }
}
