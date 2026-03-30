package com.fleetmanagement.csvimport.service;

import com.fleetmanagement.csvimport.model.ImportDataType;
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
 * Auto-suggests mappings from CSV headers to system fields.
 *
 * Priority: exact match → alias match → contains match → fuzzy match.
 *
 * SAFETY RULES:
 *  - Only ONE CSV header can map to a given system field (first match wins).
 *  - Duplicate CSV headers (e.g. "Registration Date (2)") are left unmapped
 *    for the user to resolve manually.
 *  - Contains and fuzzy matches require minimum similarity thresholds
 *    to prevent cross-wiring (e.g. date value in a string field).
 */
@Service
public class ColumnMappingService {

    private static final Logger log = LoggerFactory.getLogger(ColumnMappingService.class);

    /**
     * Fuzzy similarity threshold (0-100).
     * Set high to prevent false positives like "registrationDate" ↔ "registrationState".
     */
    private static final int FUZZY_THRESHOLD = 90;

    /**
     * Auto-suggest column mappings from CSV headers to system fields.
     */
    public Map<String, String> autoMap(List<String> csvHeaders, ImportEntityConfig config) {
        Map<String, String> mappings = new LinkedHashMap<>();
        Set<String> usedFields = new HashSet<>();

        for (String csvHeader : csvHeaders) {
            // Skip blank/empty CSV column headers
            if (csvHeader == null || csvHeader.trim().isEmpty()) continue;

            // Skip duplicate headers (suffixed with " (N)") — leave for user to map
            if (isDuplicateHeader(csvHeader)) {
                log.info("Skipping duplicate CSV header '{}' — requires manual mapping", csvHeader);
                continue;
            }

            String normalizedHeader = normalize(csvHeader);
            if (normalizedHeader.isEmpty()) continue;

            // 1. Exact match (case-insensitive, ignore spaces/underscores/hyphens)
            String exactMatch = findExactMatch(normalizedHeader, config.getFields(), usedFields);
            if (exactMatch != null) {
                mappings.put(csvHeader, exactMatch);
                usedFields.add(exactMatch);
                continue;
            }

            // 2. Alias match — CSV header matches a known alias
            String aliasMatch = findAliasMatch(normalizedHeader, config.getFields(), usedFields);
            if (aliasMatch != null) {
                mappings.put(csvHeader, aliasMatch);
                usedFields.add(aliasMatch);
                continue;
            }

            // 3. Contains match — conservative substring matching
            String containsMatch = findContainsMatch(normalizedHeader, config.getFields(), usedFields);
            if (containsMatch != null) {
                mappings.put(csvHeader, containsMatch);
                usedFields.add(containsMatch);
                continue;
            }

            // 4. Fuzzy match — high threshold to avoid mismatches
            String fuzzyMatch = findFuzzyMatch(normalizedHeader, config.getFields(), usedFields);
            if (fuzzyMatch != null) {
                mappings.put(csvHeader, fuzzyMatch);
                usedFields.add(fuzzyMatch);
            }
        }

        log.info("Auto-mapped {} of {} CSV headers for entity {}",
                mappings.size(), csvHeaders.size(), config.getEntityName());
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

    /**
     * Detect if a header is a duplicate (has " (N)" suffix added by CsvParserService).
     */
    private boolean isDuplicateHeader(String header) {
        return header.matches(".*\\s+\\(\\d+\\)$");
    }

    private String normalize(String name) {
        return name.toLowerCase()
                .replaceAll("[\\s_\\-\\.]+", "")
                .trim();
    }

    /**
     * Exact match: normalized field name or display name equals normalized header.
     */
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

    /**
     * Alias match: header matches one of the field's registered aliases.
     */
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

    /**
     * Contains match — CONSERVATIVE rules to prevent false positives:
     *
     * 1. The CSV header must be at least 4 characters long (normalized).
     * 2. The matched substring must be at least 60% of the longer string's length.
     * 3. If multiple fields match, NO match is returned (ambiguous → user resolves).
     */
    private String findContainsMatch(String normalizedHeader, List<ImportFieldDefinition> fields, Set<String> usedFields) {
        if (normalizedHeader.length() < 4) return null;

        List<String> candidates = new ArrayList<>();

        for (ImportFieldDefinition field : fields) {
            if (usedFields.contains(field.getFieldName())) continue;

            String normalizedField = normalize(field.getFieldName());
            String normalizedDisplay = normalize(field.getDisplayName());

            boolean headerContainsField = normalizedHeader.contains(normalizedField) && normalizedField.length() >= 4;
            boolean fieldContainsHeader = normalizedField.contains(normalizedHeader) && normalizedHeader.length() >= 4;
            boolean headerContainsDisplay = normalizedHeader.contains(normalizedDisplay) && normalizedDisplay.length() >= 4;
            boolean displayContainsHeader = normalizedDisplay.contains(normalizedHeader) && normalizedHeader.length() >= 4;

            if (headerContainsField || fieldContainsHeader || headerContainsDisplay || displayContainsHeader) {
                // Ensure the match covers at least 60% of the longer string
                int maxLen = Math.max(
                        Math.max(normalizedHeader.length(), normalizedField.length()),
                        normalizedDisplay.length()
                );
                int matchLen = headerContainsField || headerContainsDisplay
                        ? Math.max(normalizedField.length(), normalizedDisplay.length())
                        : normalizedHeader.length();
                double coverage = (double) matchLen / maxLen;

                if (coverage >= 0.60) {
                    candidates.add(field.getFieldName());
                }
            }
        }

        // Only return a match if exactly ONE candidate was found (no ambiguity)
        if (candidates.size() == 1) {
            return candidates.get(0);
        }
        if (candidates.size() > 1) {
            log.info("Ambiguous contains match for CSV header '{}': {} — skipping auto-map",
                    normalizedHeader, candidates);
        }
        return null;
    }

    /**
     * Fuzzy match using Jaro-Winkler similarity.
     *
     * SAFETY: If the top two candidates score within 5 points of each other,
     * the match is considered ambiguous and null is returned.
     */
    private String findFuzzyMatch(String normalizedHeader, List<ImportFieldDefinition> fields, Set<String> usedFields) {
        String bestMatch = null;
        int bestScore = 0;
        int secondBestScore = 0;

        for (ImportFieldDefinition field : fields) {
            if (usedFields.contains(field.getFieldName())) continue;
            int scoreField = FuzzySearch.weightedRatio(normalizedHeader, normalize(field.getFieldName()));
            int scoreDisplay = FuzzySearch.weightedRatio(normalizedHeader, normalize(field.getDisplayName()));

            // Also check aliases for fuzzy matching
            int scoreAlias = 0;
            if (field.getAliases() != null) {
                for (String alias : field.getAliases()) {
                    scoreAlias = Math.max(scoreAlias, FuzzySearch.weightedRatio(normalizedHeader, normalize(alias)));
                }
            }

            int score = Math.max(Math.max(scoreField, scoreDisplay), scoreAlias);
            if (score > bestScore) {
                secondBestScore = bestScore;
                bestScore = score;
                bestMatch = field.getFieldName();
            } else if (score > secondBestScore) {
                secondBestScore = score;
            }
        }

        // Only match if:
        // 1. Score exceeds threshold
        // 2. There's a clear gap (>= 5 points) between the best and second-best match
        if (bestScore >= FUZZY_THRESHOLD && (bestScore - secondBestScore) >= 5) {
            return bestMatch;
        }

        if (bestScore >= FUZZY_THRESHOLD) {
            log.info("Fuzzy match for '{}' is ambiguous (scores: {} vs {}) — skipping",
                    normalizedHeader, bestScore, secondBestScore);
        }
        return null;
    }
}
