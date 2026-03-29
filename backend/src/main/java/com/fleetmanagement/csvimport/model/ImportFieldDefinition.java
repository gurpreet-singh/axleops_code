package com.fleetmanagement.csvimport.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Describes one importable system field for an entity.
 * Used by the validation pipeline and by the UI for field metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportFieldDefinition {

    /** Internal system name, e.g. "groupName". */
    private String fieldName;

    /** UI label, e.g. "Group Name". */
    private String displayName;

    /** Data type for validation and parsing. */
    private ImportDataType dataType;

    /** Is this field mandatory? */
    @Builder.Default
    private boolean required = false;

    /** Max length for STRING fields. */
    private Integer maxLength;

    /** Min value for numeric fields. */
    private Double minValue;

    /** Max value for numeric fields. */
    private Double maxValue;

    /** Date format(s) — e.g. "dd/MM/yyyy". Supports multiple with auto-detection. */
    private String dateFormat;

    /** Allowed values if dataType is ENUM. */
    private List<String> enumValues;

    /** Should enum matching ignore case? Default: true. */
    @Builder.Default
    private boolean enumCaseInsensitive = true;

    /** Custom regex for validation (e.g., PAN format). */
    private String regexPattern;

    /** Human-readable error if regex fails. */
    private String regexErrorMessage;

    /** Must be unique within the uploaded file itself? */
    @Builder.Default
    private boolean uniqueInFile = false;

    /** Must be unique against existing DB records? Triggers duplicate detection. */
    @Builder.Default
    private boolean uniqueInDatabase = false;

    /** If set, uniqueness is checked across multiple fields sharing the same group. */
    private String uniqueCompositeGroup;

    /** Value to use if CSV cell is empty and field is not required. */
    private String defaultValue;

    /** Auto-trim leading/trailing whitespace. Default: true. */
    @Builder.Default
    private boolean trimWhitespace = true;

    /** If this field references another entity (e.g. "LedgerGroup"). */
    private String foreignKeyEntity;

    /** Which field of the FK entity to match against (e.g. "name"). */
    private String foreignKeyLookupField;

    /** Common aliases for this field (for auto-mapping). */
    private List<String> aliases;

    /** Example value for sample CSV generation. */
    private String exampleValue;

    /** A second example value for sample CSV. */
    private String exampleValue2;

    /** Brief help text shown in the UI. */
    private String helpText;
}
