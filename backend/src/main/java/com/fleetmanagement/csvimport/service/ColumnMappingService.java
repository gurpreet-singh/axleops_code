package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.ImportEntityConfig;
import com.fleetmanagement.csvimport.model.ImportFieldDefinition;
import me.xdrop.fuzzywuzzy.FuzzySearch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Stage 2: COLUMN MAPPING
 * Auto-suggests mappings using fuzzy matching and applies user-provided mappings.
 */
@Service
public class ColumnMappingService {

    private static final Logger log = LoggerFactory.getLogger(ColumnMappingService.class);
    private static final int FUZZY_THRESHOLD = 85;

    /**
     * Auto-suggest column mappings from CSV headers to system fields.
     * Priority: exact match → alias match → contains match → fuzzy match.
     */
    public Map<String, String> autoMap(List<String> csvHeaders, ImportEntityConfig config) {
        Map<String, String> mappings = new LinkedHashMap<>();
        Set<String> usedFields = new HashSet<>();

        for (String csvHeader : csvHeaders) {
            // Skip blank/empty CSV column headers (from trailing commas, etc.)
            if (csvHeader == null || csvHeader.trim().isEmpty()) continue;

            String normalizedHeader = normalize(csvHeader);
            if (normalizedHeader.isEmpty()) continue;

            // 1. Exact match (case-insensitive, ignore spaces/underscores/hyphens)
            String exactMatch = findExactMatch(normalizedHeader, config.getFields(), usedFields);
            if (exactMatch != null) {
                mappings.put(csvHeader, exactMatch);
                usedFields.add(exactMatch);
                continue;
            }

            // 2. Alias match
            String aliasMatch = findAliasMatch(normalizedHeader, config.getFields(), usedFields);
            if (aliasMatch != null) {
                mappings.put(csvHeader, aliasMatch);
                usedFields.add(aliasMatch);
                continue;
            }

            // 3. Contains match (CSV header contains system field name or vice versa)
            String containsMatch = findContainsMatch(normalizedHeader, config.getFields(), usedFields);
            if (containsMatch != null) {
                mappings.put(csvHeader, containsMatch);
                usedFields.add(containsMatch);
                continue;
            }

            // 4. Fuzzy match (Jaro-Winkler > threshold)
            String fuzzyMatch = findFuzzyMatch(normalizedHeader, config.getFields(), usedFields);
            if (fuzzyMatch != null) {
                mappings.put(csvHeader, fuzzyMatch);
                usedFields.add(fuzzyMatch);
            }
        }

        log.info("Auto-mapped {} of {} CSV headers for entity {}", mappings.size(), csvHeaders.size(), config.getEntityName());
        return mappings;
    }

    /**
     * Apply mapping to transform rows from CSV-column-keyed to system-field-keyed.
     */
    public List<Map<String, String>> applyMapping(
            List<Map<String, String>> rawRows,
            Map<String, String> mappings,
            ImportEntityConfig config) {

        List<Map<String, String>> mappedRows = new ArrayList<>();

        for (Map<String, String> rawRow : rawRows) {
            Map<String, String> mappedRow = new LinkedHashMap<>();
            for (Map.Entry<String, String> entry : mappings.entrySet()) {
                String csvColumn = entry.getKey();
                String systemField = entry.getValue();
                if (systemField != null && !systemField.isEmpty() && !"__SKIP__".equals(systemField)) {
                    String value = rawRow.getOrDefault(csvColumn, "");
                    // Apply trimming
                    ImportFieldDefinition field = config.getField(systemField);
                    if (field != null && field.isTrimWhitespace()) {
                        value = value.trim();
                    }
                    // Apply default value
                    if (value.isEmpty() && field != null && field.getDefaultValue() != null) {
                        value = field.getDefaultValue();
                    }
                    mappedRow.put(systemField, value);
                }
            }
            mappedRows.add(mappedRow);
        }

        return mappedRows;
    }

    /**
     * Validate that all required system fields have a mapping.
     * Returns list of missing required field names.
     */
    public List<String> findUnmappedRequiredFields(Map<String, String> mappings, ImportEntityConfig config) {
        Set<String> mappedFields = new HashSet<>(mappings.values());
        return config.getRequiredFields().stream()
                .map(ImportFieldDefinition::getFieldName)
                .filter(fn -> !mappedFields.contains(fn))
                .toList();
    }

    // ─── Private matching methods ────────────────────────────

    private String normalize(String name) {
        return name.toLowerCase()
                .replaceAll("[\\s_\\-]+", "")
                .trim();
    }

    private String findExactMatch(String normalizedHeader, List<ImportFieldDefinition> fields, Set<String> usedFields) {
        for (ImportFieldDefinition field : fields) {
            if (usedFields.contains(field.getFieldName())) continue;
            if (normalize(field.getFieldName()).equals(normalizedHeader) ||
                normalize(field.getDisplayName()).equals(normalizedHeader)) {
                return field.getFieldName();
            }
        }
        return null;
    }

    private String findAliasMatch(String normalizedHeader, List<ImportFieldDefinition> fields, Set<String> usedFields) {
        for (ImportFieldDefinition field : fields) {
            if (usedFields.contains(field.getFieldName())) continue;
            if (field.getAliases() != null) {
                for (String alias : field.getAliases()) {
                    if (normalize(alias).equals(normalizedHeader)) {
                        return field.getFieldName();
                    }
                }
            }
        }
        return null;
    }

    private String findContainsMatch(String normalizedHeader, List<ImportFieldDefinition> fields, Set<String> usedFields) {
        // Guard: never match empty or very short headers (causes false positives)
        if (normalizedHeader.length() < 2) return null;

        for (ImportFieldDefinition field : fields) {
            if (usedFields.contains(field.getFieldName())) continue;
            String normalizedField = normalize(field.getFieldName());
            String normalizedDisplay = normalize(field.getDisplayName());
            if (normalizedHeader.contains(normalizedField) || normalizedField.contains(normalizedHeader) ||
                normalizedHeader.contains(normalizedDisplay) || normalizedDisplay.contains(normalizedHeader)) {
                // Require minimum 4 chars to avoid false positives on "id" etc.
                if (normalizedField.length() >= 4 || normalizedDisplay.length() >= 4) {
                    return field.getFieldName();
                }
            }
        }
        return null;
    }

    private String findFuzzyMatch(String normalizedHeader, List<ImportFieldDefinition> fields, Set<String> usedFields) {
        String bestMatch = null;
        int bestScore = 0;

        for (ImportFieldDefinition field : fields) {
            if (usedFields.contains(field.getFieldName())) continue;
            int scoreField = FuzzySearch.weightedRatio(normalizedHeader, normalize(field.getFieldName()));
            int scoreDisplay = FuzzySearch.weightedRatio(normalizedHeader, normalize(field.getDisplayName()));
            int score = Math.max(scoreField, scoreDisplay);
            if (score > bestScore && score >= FUZZY_THRESHOLD) {
                bestScore = score;
                bestMatch = field.getFieldName();
            }
        }
        return bestMatch;
    }
}
