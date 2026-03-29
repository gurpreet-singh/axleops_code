package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.ImportDataType;
import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import com.fleetmanagement.csvimport.model.ImportFieldDefinition;
import com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Auto-generates sample CSV files from entity configurations.
 * No manual file creation needed — generated from ImportEntityConfig metadata.
 */
@Service
public class SampleCsvService {

    private final ImportEntityConfigRegistry registry;

    public SampleCsvService(ImportEntityConfigRegistry registry) {
        this.registry = registry;
    }

    /**
     * Generate a sample CSV for the given entity.
     * Includes: header row, description row, 2 example data rows.
     */
    public byte[] generateSampleCsv(String entityName) {
        ImportEntityConfig config = registry.get(entityName);
        List<ImportFieldDefinition> fields = config.getFields();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        // Header row
        String headers = fields.stream()
                .map(ImportFieldDefinition::getDisplayName)
                .collect(Collectors.joining(","));
        writer.println(headers);

        // Description row (commented style)
        String descriptions = fields.stream()
                .map(this::buildFieldDescription)
                .collect(Collectors.joining(","));
        writer.println(descriptions);

        // Example row 1
        String example1 = fields.stream()
                .map(f -> escapeCsv(f.getExampleValue() != null ? f.getExampleValue() : generateExample(f, 1)))
                .collect(Collectors.joining(","));
        writer.println(example1);

        // Example row 2
        String example2 = fields.stream()
                .map(f -> escapeCsv(f.getExampleValue2() != null ? f.getExampleValue2() : generateExample(f, 2)))
                .collect(Collectors.joining(","));
        writer.println(example2);

        writer.flush();
        return baos.toByteArray();
    }

    public String getSampleFileName(String entityName) {
        ImportEntityConfig config = registry.get(entityName);
        if (config.getSampleCsvFileName() != null) return config.getSampleCsvFileName();
        return entityName.toLowerCase().replace("_", "-") + "-sample.csv";
    }

    private String buildFieldDescription(ImportFieldDefinition field) {
        StringBuilder sb = new StringBuilder();
        sb.append(field.isRequired() ? "Required" : "Optional");
        if (field.getDataType() == ImportDataType.ENUM && field.getEnumValues() != null) {
            sb.append(" | Values: ").append(String.join("/", field.getEnumValues()));
        }
        if (field.getDataType() == ImportDataType.DATE) {
            sb.append(" | Format: ").append(field.getDateFormat() != null ? field.getDateFormat() : "dd/MM/yyyy");
        }
        if (field.getRegexPattern() != null) {
            sb.append(" | Pattern: ").append(field.getRegexPattern());
        }
        if (field.getMaxLength() != null) {
            sb.append(" | Max: ").append(field.getMaxLength()).append(" chars");
        }
        return escapeCsv(sb.toString());
    }

    private String generateExample(ImportFieldDefinition field, int variant) {
        return switch (field.getDataType()) {
            case STRING -> field.getDisplayName() + " " + variant;
            case INTEGER -> String.valueOf(100 + variant);
            case LONG -> String.valueOf(10000L + variant);
            case DOUBLE -> String.valueOf(1000.0 + variant * 50);
            case BOOLEAN -> variant == 1 ? "true" : "false";
            case DATE -> variant == 1 ? "01/01/2025" : "15/06/2025";
            case ENUM -> field.getEnumValues() != null && !field.getEnumValues().isEmpty() ?
                    field.getEnumValues().get(Math.min(variant - 1, field.getEnumValues().size() - 1)) : "VALUE";
            case EMAIL -> "user" + variant + "@example.com";
            case PHONE -> "98765" + String.format("%05d", variant);
            case PAN -> "ABCDE" + String.format("%04d", variant) + "F";
            case GSTIN -> "29ABCDE" + String.format("%04d", variant) + "F1Z5";
        };
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
