package com.fleetmanagement.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.csvimport.dto.*;
import com.fleetmanagement.csvimport.model.*;
import com.fleetmanagement.csvimport.registry.ImportEntityConfigRegistry;
import com.fleetmanagement.csvimport.service.*;
import com.fleetmanagement.entity.ImportAuditLog;
import com.fleetmanagement.entity.ImportMappingTemplate;
import com.fleetmanagement.entity.ImportSession;
import com.fleetmanagement.repository.ImportAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportEntityConfigRegistry registry;
    private final CsvParserService csvParserService;
    private final ColumnMappingService columnMappingService;
    private final RowValidationService rowValidationService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final ImportPersistenceService importPersistenceService;
    private final ImportSessionService sessionService;
    private final MappingTemplateService templateService;
    private final SampleCsvService sampleCsvService;
    private final ImportAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    // ═══════════════════════════════════════════════════════════
    // ENTITY METADATA
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/entities")
    public ResponseEntity<List<ImportEntityInfo>> getEntities() {
        List<ImportEntityInfo> entities = registry.getAll().stream()
                .map(this::toEntityInfo)
                .toList();
        return ResponseEntity.ok(entities);
    }

    @GetMapping("/entities/{entityName}/fields")
    public ResponseEntity<List<ImportFieldInfo>> getFields(@PathVariable String entityName) {
        ImportEntityConfig config = registry.get(entityName);
        List<ImportFieldInfo> fields = config.getFields().stream()
                .map(this::toFieldInfo)
                .toList();
        return ResponseEntity.ok(fields);
    }

    @GetMapping("/entities/{entityName}/sample-csv")
    public ResponseEntity<byte[]> downloadSampleCsv(@PathVariable String entityName) {
        byte[] csv = sampleCsvService.generateSampleCsv(entityName);
        String filename = sampleCsvService.getSampleFileName(entityName);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    // ═══════════════════════════════════════════════════════════
    // FILE UPLOAD
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityName") String entityName) {

        ImportEntityConfig config = registry.get(entityName);

        // File validations
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (file.getSize() > config.getMaxFileSize()) {
            throw new IllegalArgumentException("File exceeds maximum size of " + (config.getMaxFileSize() / 1024 / 1024) + "MB");
        }

        // Parse CSV
        ParsedFile parsed = csvParserService.parse(file);

        if (parsed.getRowCount() > config.getMaxRowCount()) {
            throw new IllegalArgumentException("File has " + parsed.getRowCount() + " rows, maximum is " + config.getMaxRowCount());
        }

        // Create session
        String userId = getCurrentUserId();
        ImportSession session = sessionService.createSession(
                entityName,
                file.getOriginalFilename(),
                file.getSize(),
                parsed.getHeaders(),
                parsed.getRows(),
                userId
        );

        // Build response with preview
        List<Map<String, String>> previewRows = parsed.getRows().stream()
                .limit(5)
                .toList();

        UploadResponse response = UploadResponse.builder()
                .importSessionId(session.getId())
                .headers(parsed.getHeaders())
                .rowCount(parsed.getRowCount())
                .columnCount(parsed.getColumnCount())
                .previewRows(previewRows)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build();

        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════
    // COLUMN MAPPING
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/{sessionId}/auto-map")
    public ResponseEntity<Map<String, String>> autoMap(@PathVariable UUID sessionId) {
        ImportSession session = sessionService.getSession(sessionId);
        ImportEntityConfig config = registry.get(session.getEntityName());

        Map<String, String> suggestions = columnMappingService.autoMap(session.getCsvHeaders(), config);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/{sessionId}/map")
    public ResponseEntity<MappingResponse> applyMapping(
            @PathVariable UUID sessionId,
            @RequestBody Map<String, Object> body) {

        ImportSession session = sessionService.getSession(sessionId);
        ImportEntityConfig config = registry.get(session.getEntityName());

        @SuppressWarnings("unchecked")
        Map<String, String> mappings = (Map<String, String>) body.get("mappings");

        // Apply mapping
        List<Map<String, String>> mappedRows = columnMappingService.applyMapping(
                session.getRawRows(), mappings, config);

        // Validate
        List<ValidatedRow> validatedRows = rowValidationService.validate(
                mappedRows, session.getRawRows(), config);

        // Detect duplicates
        validatedRows = duplicateDetectionService.detectDuplicates(validatedRows, config);

        // Save to session
        sessionService.updateWithMappingResults(sessionId, mappings, mappedRows, validatedRows);

        // Build response
        MappingResponse response = buildMappingResponse(validatedRows);
        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════
    // INLINE EDIT
    // ═══════════════════════════════════════════════════════════

    @PutMapping("/{sessionId}/rows/{rowIndex}")
    public ResponseEntity<MappingResponse.RowResult> editRow(
            @PathVariable UUID sessionId,
            @PathVariable int rowIndex,
            @RequestBody Map<String, String> updates) {

        ImportSession session = sessionService.getSession(sessionId);
        ImportEntityConfig config = registry.get(session.getEntityName());

        List<ValidatedRow> rows = sessionService.getValidatedRows(sessionId);
        if (rowIndex < 0 || rowIndex >= rows.size()) {
            throw new IllegalArgumentException("Invalid row index: " + rowIndex);
        }

        ValidatedRow row = rows.get(rowIndex);
        // Apply updates
        row.getData().putAll(updates);

        // Re-validate
        ValidatedRow revalidated = rowValidationService.revalidateRow(
                row.getData(), row.getOriginalData(), row.getRowNumber(), config);

        // If it was previously a duplicate, keep that status unless now invalid
        if (row.isDuplicate() && revalidated.isValid()) {
            revalidated.setStatus(RowStatus.DUPLICATE);
            revalidated.setDuplicateReason(row.getDuplicateReason());
        }

        // Save updated row
        sessionService.updateValidatedRow(sessionId, rowIndex, revalidated);

        MappingResponse.RowResult result = MappingResponse.RowResult.builder()
                .rowNumber(revalidated.getRowNumber())
                .data(revalidated.getData())
                .status(revalidated.getStatus())
                .errors(revalidated.getErrors())
                .duplicateReason(revalidated.getDuplicateReason())
                .build();

        return ResponseEntity.ok(result);
    }

    // ═══════════════════════════════════════════════════════════
    // EXPORT ERRORS / DUPLICATES
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/{sessionId}/export-errors")
    public ResponseEntity<byte[]> exportErrors(@PathVariable UUID sessionId) {
        ImportSession session = sessionService.getSession(sessionId);
        List<ValidatedRow> rows = sessionService.getValidatedRows(sessionId);

        List<ValidatedRow> errorRows = rows.stream()
                .filter(ValidatedRow::isInvalid)
                .toList();

        byte[] csv = buildErrorCsv(errorRows, session.getCsvHeaders());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"import-errors.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/{sessionId}/export-duplicates")
    public ResponseEntity<byte[]> exportDuplicates(@PathVariable UUID sessionId) {
        ImportSession session = sessionService.getSession(sessionId);
        List<ValidatedRow> rows = sessionService.getValidatedRows(sessionId);

        List<ValidatedRow> dupeRows = rows.stream()
                .filter(ValidatedRow::isDuplicate)
                .toList();

        byte[] csv = buildDuplicateCsv(dupeRows, session.getCsvHeaders());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"import-duplicates.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    // ═══════════════════════════════════════════════════════════
    // EXECUTE IMPORT
    // ═══════════════════════════════════════════════════════════

    @PostMapping("/{sessionId}/execute")
    public ResponseEntity<ImportResult> executeImport(
            @PathVariable UUID sessionId,
            @RequestBody Map<String, String> body) {

        ImportSession session = sessionService.getSession(sessionId);
        ImportEntityConfig config = registry.get(session.getEntityName());

        DuplicateStrategy strategy = DuplicateStrategy.valueOf(
                body.getOrDefault("duplicateStrategy", "SKIP"));

        // Update status
        sessionService.updateStatus(sessionId, ImportSessionStatus.IMPORTING);

        List<ValidatedRow> validatedRows = sessionService.getValidatedRows(sessionId);

        // Execute import
        ImportResult result = importPersistenceService.persist(validatedRows, config, strategy);

        // Save result
        sessionService.saveImportResult(sessionId, result);

        // Create audit log
        String userId = getCurrentUserId();
        createAuditLog(session, result, strategy, userId);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{sessionId}/status")
    public ResponseEntity<ImportProgressResponse> getStatus(@PathVariable UUID sessionId) {
        ImportSession session = sessionService.getSession(sessionId);

        ImportResult result = null;
        if (session.getImportResultJson() != null) {
            try {
                result = objectMapper.readValue(session.getImportResultJson(), ImportResult.class);
            } catch (Exception ignored) {}
        }

        int processed = session.getProcessedRows() != null ? session.getProcessedRows() : 0;
        int total = session.getTotalRows() != null ? session.getTotalRows() : 0;
        double percent = total > 0 ? (double) processed / total * 100 : 0;

        ImportProgressResponse response = ImportProgressResponse.builder()
                .status(session.getStatus())
                .processedRows(processed)
                .totalRows(total)
                .percentComplete(percent)
                .result(result)
                .build();

        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════
    // MAPPING TEMPLATES
    // ═══════════════════════════════════════════════════════════

    @GetMapping("/mapping-templates")
    public ResponseEntity<List<MappingTemplateResponse>> getTemplates(
            @RequestParam String entityName) {
        List<ImportMappingTemplate> templates = templateService.getTemplates(entityName);
        List<MappingTemplateResponse> response = templates.stream()
                .map(this::toTemplateResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mapping-templates")
    public ResponseEntity<MappingTemplateResponse> saveTemplate(
            @RequestBody Map<String, Object> body) {

        String entityName = (String) body.get("entityName");
        String templateName = (String) body.get("templateName");
        @SuppressWarnings("unchecked")
        Map<String, String> mappings = (Map<String, String>) body.get("mappings");
        @SuppressWarnings("unchecked")
        List<String> csvHeaders = (List<String>) body.get("csvHeaders");
        boolean setAsDefault = Boolean.TRUE.equals(body.get("setAsDefault"));
        String userId = getCurrentUserId();

        ImportMappingTemplate template = templateService.saveTemplate(
                entityName, templateName, mappings, csvHeaders, setAsDefault, userId);

        return ResponseEntity.ok(toTemplateResponse(template));
    }

    @PutMapping("/mapping-templates/{templateId}")
    public ResponseEntity<MappingTemplateResponse> updateTemplate(
            @PathVariable UUID templateId,
            @RequestBody Map<String, Object> body) {

        String templateName = (String) body.get("templateName");
        @SuppressWarnings("unchecked")
        Map<String, String> mappings = (Map<String, String>) body.get("mappings");
        Boolean setAsDefault = (Boolean) body.get("setAsDefault");

        ImportMappingTemplate template = templateService.updateTemplate(
                templateId, templateName, mappings, setAsDefault);

        return ResponseEntity.ok(toTemplateResponse(template));
    }

    @DeleteMapping("/mapping-templates/{templateId}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID templateId) {
        templateService.deleteTemplate(templateId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/detect-template")
    public ResponseEntity<DetectTemplateResponse> detectTemplate(@PathVariable UUID sessionId) {
        ImportSession session = sessionService.getSession(sessionId);

        MappingTemplateService.TemplateDetectionResult detection =
                templateService.detectTemplate(session.getEntityName(), session.getCsvHeaders());

        DetectTemplateResponse.MatchedTemplate matched = null;
        if (detection.matchedTemplate() != null) {
            ImportMappingTemplate t = detection.matchedTemplate();
            matched = DetectTemplateResponse.MatchedTemplate.builder()
                    .id(t.getId())
                    .name(t.getTemplateName())
                    .mappings(t.getMappingsJson())
                    .matchPercentage(detection.matchPercentage() * 100)
                    .isDefault(Boolean.TRUE.equals(t.getIsDefault()))
                    .build();
        }

        List<MappingTemplateResponse> allTemplates = detection.allTemplates().stream()
                .map(this::toTemplateResponse)
                .toList();

        DetectTemplateResponse response = DetectTemplateResponse.builder()
                .matchedTemplate(matched)
                .allTemplates(allTemplates)
                .build();

        return ResponseEntity.ok(response);
    }

    // ═══════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof TenantPrincipal tp) {
            return tp.userId().toString();
        }
        return "system";
    }

    private ImportEntityInfo toEntityInfo(ImportEntityConfig config) {
        List<ImportFieldInfo> fieldInfos = config.getFields().stream()
                .map(this::toFieldInfo)
                .toList();

        return ImportEntityInfo.builder()
                .entityName(config.getEntityName())
                .displayName(config.getDisplayName())
                .description(config.getDescription())
                .icon(config.getIcon())
                .fields(fieldInfos)
                .requiredFieldCount((int) config.getFields().stream().filter(ImportFieldDefinition::isRequired).count())
                .totalFieldCount(config.getFields().size())
                .build();
    }

    private ImportFieldInfo toFieldInfo(ImportFieldDefinition field) {
        return ImportFieldInfo.builder()
                .fieldName(field.getFieldName())
                .displayName(field.getDisplayName())
                .dataType(field.getDataType())
                .required(field.isRequired())
                .maxLength(field.getMaxLength())
                .minValue(field.getMinValue())
                .maxValue(field.getMaxValue())
                .dateFormat(field.getDateFormat())
                .enumValues(field.getEnumValues())
                .regexPattern(field.getRegexPattern())
                .uniqueInDatabase(field.isUniqueInDatabase())
                .helpText(field.getHelpText())
                .foreignKeyEntity(field.getForeignKeyEntity())
                .build();
    }

    private MappingTemplateResponse toTemplateResponse(ImportMappingTemplate template) {
        return MappingTemplateResponse.builder()
                .id(template.getId())
                .templateName(template.getTemplateName())
                .entityName(template.getEntityName())
                .mappings(template.getMappingsJson())
                .csvHeaders(template.getCsvHeaders())
                .isDefault(Boolean.TRUE.equals(template.getIsDefault()))
                .useCount(template.getUseCount() != null ? template.getUseCount() : 0)
                .lastUsedAt(template.getLastUsedAt())
                .createdBy(template.getCreatedBy())
                .createdAt(template.getCreatedAt())
                .build();
    }

    private MappingResponse buildMappingResponse(List<ValidatedRow> validatedRows) {
        List<MappingResponse.RowResult> validResults = validatedRows.stream()
                .filter(ValidatedRow::isValid)
                .map(this::toRowResult)
                .toList();

        List<MappingResponse.RowResult> errorResults = validatedRows.stream()
                .filter(ValidatedRow::isInvalid)
                .map(this::toRowResult)
                .toList();

        List<MappingResponse.RowResult> dupeResults = validatedRows.stream()
                .filter(ValidatedRow::isDuplicate)
                .map(this::toRowResult)
                .toList();

        return MappingResponse.builder()
                .validCount(validResults.size())
                .errorCount(errorResults.size())
                .duplicateCount(dupeResults.size())
                .totalCount(validatedRows.size())
                .validRows(validResults)
                .errorRows(errorResults)
                .duplicateRows(dupeResults)
                .build();
    }

    private MappingResponse.RowResult toRowResult(ValidatedRow row) {
        return MappingResponse.RowResult.builder()
                .rowNumber(row.getRowNumber())
                .data(row.getData())
                .status(row.getStatus())
                .errors(row.getErrors())
                .duplicateReason(row.getDuplicateReason())
                .build();
    }

    private byte[] buildErrorCsv(List<ValidatedRow> errorRows, List<String> csvHeaders) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        // Header with extra column
        List<String> allHeaders = new ArrayList<>(csvHeaders);
        allHeaders.add("__Import_Errors");
        writer.println(allHeaders.stream().map(this::escapeCsv).collect(Collectors.joining(",")));

        for (ValidatedRow row : errorRows) {
            List<String> values = new ArrayList<>();
            for (String header : csvHeaders) {
                values.add(escapeCsv(row.getOriginalData().getOrDefault(header, "")));
            }
            // Error details
            String errorDetail = row.getErrors().stream()
                    .map(e -> "[" + e.getFieldName() + "] " + e.getMessage())
                    .collect(Collectors.joining(" | "));
            values.add(escapeCsv(errorDetail));
            writer.println(String.join(",", values));
        }

        writer.flush();
        return baos.toByteArray();
    }

    private byte[] buildDuplicateCsv(List<ValidatedRow> dupeRows, List<String> csvHeaders) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        List<String> allHeaders = new ArrayList<>(csvHeaders);
        allHeaders.add("__Duplicate_Reason");
        writer.println(allHeaders.stream().map(this::escapeCsv).collect(Collectors.joining(",")));

        for (ValidatedRow row : dupeRows) {
            List<String> values = new ArrayList<>();
            for (String header : csvHeaders) {
                values.add(escapeCsv(row.getOriginalData().getOrDefault(header, "")));
            }
            values.add(escapeCsv(row.getDuplicateReason() != null ? row.getDuplicateReason() : ""));
            writer.println(String.join(",", values));
        }

        writer.flush();
        return baos.toByteArray();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private void createAuditLog(ImportSession session, ImportResult result,
                                 DuplicateStrategy strategy, String userId) {
        ImportAuditLog auditLog = new ImportAuditLog();
        auditLog.setTenantId(session.getTenantId());
        auditLog.setEntityName(session.getEntityName());
        auditLog.setFileName(session.getOriginalFileName());
        auditLog.setFileSizeBytes(session.getFileSizeBytes());
        auditLog.setTotalRows(result.getTotalRows());
        auditLog.setImportedRows(result.getImportedRows());
        auditLog.setErrorRows(result.getErrorRows());
        auditLog.setDuplicateRows(result.getDuplicateRows());
        auditLog.setOverwrittenRows(result.getOverwrittenRows());
        auditLog.setDuplicateStrategy(strategy.name());
        auditLog.setMappingSnapshot(session.getColumnMappings());
        auditLog.setStatus(result.getErrorRows() > 0 ? "PARTIAL" : "COMPLETED");
        auditLog.setImportedBy(userId);
        auditLog.setStartedAt(session.getUploadedAt());
        auditLog.setCompletedAt(LocalDateTime.now());

        auditLogRepository.save(auditLog);
    }
}
