package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Stage 3: ROW VALIDATION
 * Validates every row against entity-specific field rules.
 * Collects ALL errors per row (doesn't stop at first error).
 */
@Service
public class RowValidationService {

    private static final Logger log = LoggerFactory.getLogger(RowValidationService.class);

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[+]?[0-9\\s\\-()]{7,15}$");
    private static final Pattern PAN_PATTERN = Pattern.compile(
            "[A-Z]{5}[0-9]{4}[A-Z]");
    private static final Pattern GSTIN_PATTERN = Pattern.compile(
            "[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}");

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),
            DateTimeFormatter.ofPattern("d/M/yyyy"),
            DateTimeFormatter.ofPattern("d-M-yyyy")
    );

    /**
     * Validate all mapped rows against field definitions.
     * Returns a list of ValidatedRows with status and any errors.
     */
    public List<ValidatedRow> validate(
            List<Map<String, String>> mappedRows,
            List<Map<String, String>> rawRows,
            ImportEntityConfig config) {

        List<ValidatedRow> results = new ArrayList<>();
        Map<String, Set<String>> uniqueInFileTracker = new HashMap<>();

        for (int i = 0; i < mappedRows.size(); i++) {
            Map<String, String> row = mappedRows.get(i);
            Map<String, String> originalRow = i < rawRows.size() ? rawRows.get(i) : row;
            List<FieldError> errors = new ArrayList<>();

            for (ImportFieldDefinition field : config.getFields()) {
                String value = row.getOrDefault(field.getFieldName(), "");

                // Required check — treat null-like placeholders as empty
                if (field.isRequired() && isEffectivelyNull(value)) {
                    errors.add(FieldError.builder()
                            .fieldName(field.getFieldName())
                            .value(value)
                            .errorCode("REQUIRED")
                            .message(field.getDisplayName() + " is required")
                            .build());
                    continue;
                }

                // Skip further validation if effectively null and not required
                if (isEffectivelyNull(value)) continue;

                // Data type validation
                validateDataType(field, value, errors);

                // Max length
                if (field.getMaxLength() != null && value.length() > field.getMaxLength()) {
                    errors.add(FieldError.builder()
                            .fieldName(field.getFieldName())
                            .value(value)
                            .errorCode("MAX_LENGTH")
                            .message(field.getDisplayName() + " exceeds maximum length of " + field.getMaxLength())
                            .build());
                }

                // Min/Max value for numeric fields
                validateNumericRange(field, value, errors);

                // Regex
                if (field.getRegexPattern() != null && !value.isEmpty()) {
                    if (!Pattern.matches(field.getRegexPattern(), value)) {
                        String msg = field.getRegexErrorMessage() != null ?
                                field.getRegexErrorMessage() :
                                field.getDisplayName() + " has invalid format";
                        errors.add(FieldError.builder()
                                .fieldName(field.getFieldName())
                                .value(value)
                                .errorCode("REGEX_MISMATCH")
                                .message(msg)
                                .build());
                    }
                }

                // Enum membership
                if (field.getDataType() == ImportDataType.ENUM && field.getEnumValues() != null && !value.isEmpty()) {
                    boolean matched = field.isEnumCaseInsensitive() ?
                            field.getEnumValues().stream().anyMatch(e -> e.equalsIgnoreCase(value.trim())) :
                            field.getEnumValues().contains(value.trim());
                    if (!matched) {
                        errors.add(FieldError.builder()
                                .fieldName(field.getFieldName())
                                .value(value)
                                .errorCode("INVALID_ENUM")
                                .message("Must be one of: " + String.join(", ", field.getEnumValues()))
                                .build());
                    }
                }

                // Unique in file
                if (field.isUniqueInFile() && !value.isEmpty()) {
                    String trackKey = field.getFieldName();
                    Set<String> seen = uniqueInFileTracker.computeIfAbsent(trackKey, k -> new HashSet<>());
                    String normalizedVal = value.trim().toLowerCase();
                    if (seen.contains(normalizedVal)) {
                        errors.add(FieldError.builder()
                                .fieldName(field.getFieldName())
                                .value(value)
                                .errorCode("DUPLICATE_IN_FILE")
                                .message(field.getDisplayName() + " '" + value + "' appears multiple times in the file")
                                .build());
                    } else {
                        seen.add(normalizedVal);
                    }
                }
            }

            ValidatedRow validatedRow = ValidatedRow.builder()
                    .rowNumber(i + 1)
                    .data(row)
                    .originalData(originalRow)
                    .errors(errors)
                    .status(errors.isEmpty() ? RowStatus.VALID : RowStatus.INVALID)
                    .build();
            results.add(validatedRow);
        }

        long validCount = results.stream().filter(ValidatedRow::isValid).count();
        long errorCount = results.stream().filter(ValidatedRow::isInvalid).count();
        log.info("Validation complete for {}: {} valid, {} errors out of {} rows",
                config.getEntityName(), validCount, errorCount, results.size());

        return results;
    }

    /**
     * Re-validate a single row after inline edit.
     */
    public ValidatedRow revalidateRow(Map<String, String> rowData, Map<String, String> originalData, int rowNumber, ImportEntityConfig config) {
        List<Map<String, String>> singleRow = List.of(rowData);
        List<Map<String, String>> singleOriginal = List.of(originalData);
        List<ValidatedRow> results = validate(singleRow, singleOriginal, config);
        ValidatedRow result = results.get(0);
        result.setRowNumber(rowNumber);
        return result;
    }

    // ─── Private validation helpers ────────────────────────────

    private void validateDataType(ImportFieldDefinition field, String value, List<FieldError> errors) {
        if (isEffectivelyNull(value)) return;

        switch (field.getDataType()) {
            case INTEGER:
                try {
                    String cleanInt = cleanNumeric(value);
                    if (cleanInt.isEmpty()) break;  // empty after cleaning = valid (defaults to 0)
                    Integer.parseInt(cleanInt);
                } catch (NumberFormatException e) {
                    errors.add(makeError(field, value, "INVALID_INTEGER", "Must be a valid integer"));
                }
                break;
            case LONG:
                try {
                    String cleanLong = cleanNumeric(value);
                    if (cleanLong.isEmpty()) break;
                    Long.parseLong(cleanLong);
                } catch (NumberFormatException e) {
                    errors.add(makeError(field, value, "INVALID_LONG", "Must be a valid number"));
                }
                break;
            case DOUBLE:
                try {
                    String cleanDbl = cleanNumeric(value);
                    if (cleanDbl.isEmpty()) break;
                    Double.parseDouble(cleanDbl);
                } catch (NumberFormatException e) {
                    errors.add(makeError(field, value, "INVALID_DOUBLE", "Must be a valid decimal number"));
                }
                break;
            case BOOLEAN:
                if (!isValidBoolean(value)) {
                    errors.add(makeError(field, value, "INVALID_BOOLEAN", "Must be true/false, yes/no, 1/0, or Y/N"));
                }
                break;
            case DATE:
                if (!isValidDate(value, field.getDateFormat())) {
                    errors.add(makeError(field, value, "INVALID_DATE", "Invalid date format. Expected formats: dd/MM/yyyy, yyyy-MM-dd, etc."));
                }
                break;
            case EMAIL:
                if (!EMAIL_PATTERN.matcher(value.trim()).matches()) {
                    errors.add(makeError(field, value, "INVALID_EMAIL", "Must be a valid email address"));
                }
                break;
            case PHONE:
                if (!PHONE_PATTERN.matcher(value.trim().replaceAll("\\s", "")).matches()) {
                    errors.add(makeError(field, value, "INVALID_PHONE", "Must be a valid phone number"));
                }
                break;
            case PAN:
                if (!PAN_PATTERN.matcher(value.trim().toUpperCase()).matches()) {
                    errors.add(makeError(field, value, "INVALID_PAN", "Invalid PAN format (expected: ABCDE1234F)"));
                }
                break;
            case GSTIN:
                if (!GSTIN_PATTERN.matcher(value.trim().toUpperCase()).matches()) {
                    errors.add(makeError(field, value, "INVALID_GSTIN", "Invalid GSTIN format"));
                }
                break;
            default:
                break;
        }
    }

    private void validateNumericRange(ImportFieldDefinition field, String value, List<FieldError> errors) {
        if (field.getMinValue() == null && field.getMaxValue() == null) return;
        if (field.getDataType() != ImportDataType.INTEGER &&
            field.getDataType() != ImportDataType.LONG &&
            field.getDataType() != ImportDataType.DOUBLE) return;

        try {
            double numVal = Double.parseDouble(cleanNumeric(value));
            if (field.getMinValue() != null && numVal < field.getMinValue()) {
                errors.add(makeError(field, value, "MIN_VALUE",
                        field.getDisplayName() + " must be at least " + field.getMinValue().intValue()));
            }
            if (field.getMaxValue() != null && numVal > field.getMaxValue()) {
                errors.add(makeError(field, value, "MAX_VALUE",
                        field.getDisplayName() + " must be at most " + field.getMaxValue().intValue()));
            }
        } catch (NumberFormatException ignored) {
            // Already reported as invalid type
        }
    }

    private String cleanNumeric(String value) {
        if (value == null) return "";
        // First check if effectively null before any cleaning
        if (isEffectivelyNull(value)) return "";

        // Strip currency symbols, whitespace, commas, and common formatting
        String cleaned = value.trim()
                .replace("₹", "").replace("$", "").replace("€", "").replace("£", "")
                .replace("¥", "").replace("Rs.", "").replace("Rs", "").replace("INR", "")
                .replace("\u00A0", "")    // non-breaking space
                .replace("\u2012", "-")   // figure dash → hyphen
                .replace("\u2013", "-")   // en-dash → hyphen
                .replace("\u2014", "-")   // em-dash → hyphen
                .replace("\u2015", "-")   // horizontal bar → hyphen
                .replaceAll("[,\\s]", "") // commas and whitespace
                .trim();

        // After cleaning, check again
        if (isEffectivelyNull(cleaned)) return "";

        // If the cleaned value is just a sign character, treat as empty
        if (cleaned.equals("+") || cleaned.equals("-")) return "";

        return cleaned;
    }

    /**
     * Detects whether a CSV cell value is effectively null/empty.
     * Handles all common representations of "no data" across CSV exports
     * from Excel, Google Sheets, Tally, SAP, and other ERP systems.
     */
    private boolean isEffectivelyNull(String value) {
        if (value == null || value.isEmpty()) return true;
        String lower = value.trim().toLowerCase();
        return lower.isEmpty()
                || lower.equals("-")
                || lower.equals("--")
                || lower.equals("---")
                || lower.equals("na")
                || lower.equals("n/a")
                || lower.equals("n.a.")
                || lower.equals("n.a")
                || lower.equals("nil")
                || lower.equals("null")
                || lower.equals("none")
                || lower.equals("empty")
                || lower.equals("blank")
                || lower.equals(".")
                || lower.equals("..")
                || lower.equals("#n/a")
                || lower.equals("#na")
                || lower.equals("#value!")
                || lower.equals("#ref!")
                || lower.equals("#div/0!")
                || lower.equals("#null!")
                || lower.equals("not applicable")
                || lower.equals("not available")
                || lower.equals("undefined");
    }

    private boolean isValidBoolean(String value) {
        String v = value.trim().toLowerCase();
        return Set.of("true", "false", "yes", "no", "1", "0", "y", "n").contains(v);
    }

    private boolean isValidDate(String value, String customFormat) {
        String trimmed = value.trim();
        // Try custom format first
        if (customFormat != null) {
            try {
                LocalDate.parse(trimmed, DateTimeFormatter.ofPattern(customFormat));
                return true;
            } catch (DateTimeParseException ignored) {}
        }
        // Try all common full-date formats
        for (DateTimeFormatter fmt : DATE_FORMATS) {
            try {
                LocalDate.parse(trimmed, fmt);
                return true;
            } catch (DateTimeParseException ignored) {}
        }
        // Try month-year formats (e.g. "2026-02", "03/2022", "03-2022", "2022/03")
        if (tryParseMonthYear(trimmed) != null) return true;
        return false;
    }

    /**
     * Parse month-year strings like "YYYY-MM", "MM/YYYY", "MM-YYYY", "YYYY/MM".
     * Returns the 1st of that month as LocalDate, or null if unparseable.
     */
    private LocalDate tryParseMonthYear(String value) {
        if (value == null) return null;
        String v = value.trim();
        // YYYY-MM or YYYY/MM
        if (v.matches("\\d{4}[/\\-]\\d{1,2}")) {
            String[] parts = v.split("[/\\-]");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            if (month >= 1 && month <= 12 && year >= 1900 && year <= 2100)
                return LocalDate.of(year, month, 1);
        }
        // MM/YYYY or MM-YYYY
        if (v.matches("\\d{1,2}[/\\-]\\d{4}")) {
            String[] parts = v.split("[/\\-]");
            int month = Integer.parseInt(parts[0]);
            int year = Integer.parseInt(parts[1]);
            if (month >= 1 && month <= 12 && year >= 1900 && year <= 2100)
                return LocalDate.of(year, month, 1);
        }
        return null;
    }

    private FieldError makeError(ImportFieldDefinition field, String value, String code, String message) {
        return FieldError.builder()
                .fieldName(field.getFieldName())
                .value(value)
                .errorCode(code)
                .message(message)
                .build();
    }
}
