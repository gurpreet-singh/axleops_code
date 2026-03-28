package com.fleetmanagement.csvimport.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.csvimport.model.*;
import com.fleetmanagement.entity.ImportSession;
import com.fleetmanagement.repository.ImportSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Manages ImportSession lifecycle — create, update, expire, look up.
 */
@Service
@Transactional
public class ImportSessionService {

    private static final Logger log = LoggerFactory.getLogger(ImportSessionService.class);
    private static final int SESSION_TTL_MINUTES = 30;

    private final ImportSessionRepository sessionRepository;
    private final ObjectMapper objectMapper;

    public ImportSessionService(ImportSessionRepository sessionRepository, ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Create a new import session after file upload.
     */
    public ImportSession createSession(String entityName, String fileName, Long fileSize,
                                        List<String> headers, List<Map<String, String>> rawRows,
                                        String createdBy) {
        ImportSession session = new ImportSession();
        session.setTenantId(TenantContext.get());
        session.setEntityName(entityName);
        session.setOriginalFileName(fileName);
        session.setFileSizeBytes(fileSize);
        session.setCsvHeaders(headers);
        session.setRawRows(rawRows);
        session.setTotalRows(rawRows.size());
        session.setStatus(ImportSessionStatus.UPLOADED);
        session.setCreatedBy(createdBy);
        session.setExpiresAt(LocalDateTime.now().plusMinutes(SESSION_TTL_MINUTES));

        session = sessionRepository.save(session);
        log.info("Created import session {} for entity {} ({} rows)", session.getId(), entityName, rawRows.size());
        return session;
    }

    /**
     * Get a session by ID, scoped to current tenant.
     */
    public ImportSession getSession(UUID sessionId) {
        UUID tenantId = TenantContext.get();
        ImportSession session = sessionRepository.findByIdAndTenantId(sessionId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Import session not found: " + sessionId));

        // Refresh expiry on access
        session.setExpiresAt(LocalDateTime.now().plusMinutes(SESSION_TTL_MINUTES));
        return sessionRepository.save(session);
    }

    /**
     * Update session with mapping and validation results.
     */
    public void updateWithMappingResults(UUID sessionId, Map<String, String> mappings,
                                          List<Map<String, String>> mappedRows,
                                          List<ValidatedRow> validatedRows) {
        ImportSession session = getSession(sessionId);
        session.setColumnMappings(mappings);
        session.setMappedRows(mappedRows);
        session.setStatus(ImportSessionStatus.VALIDATED);

        // Serialize validated rows
        try {
            session.setValidatedRowsJson(objectMapper.writeValueAsString(validatedRows));
        } catch (Exception e) {
            log.error("Failed to serialize validated rows", e);
        }

        session.setValidCount((int) validatedRows.stream().filter(ValidatedRow::isValid).count());
        session.setErrorCount((int) validatedRows.stream().filter(ValidatedRow::isInvalid).count());
        session.setDuplicateCount((int) validatedRows.stream().filter(ValidatedRow::isDuplicate).count());

        sessionRepository.save(session);
    }

    /**
     * Deserialize validated rows from session.
     */
    public List<ValidatedRow> getValidatedRows(UUID sessionId) {
        ImportSession session = getSession(sessionId);
        if (session.getValidatedRowsJson() == null) return List.of();
        try {
            return objectMapper.readValue(session.getValidatedRowsJson(),
                    new TypeReference<List<ValidatedRow>>() {});
        } catch (Exception e) {
            log.error("Failed to deserialize validated rows", e);
            return List.of();
        }
    }

    /**
     * Update session status.
     */
    public void updateStatus(UUID sessionId, ImportSessionStatus status) {
        ImportSession session = getSession(sessionId);
        session.setStatus(status);
        sessionRepository.save(session);
    }

    /**
     * Update progress during import execution.
     */
    public void updateProgress(UUID sessionId, int processedRows) {
        ImportSession session = getSession(sessionId);
        session.setProcessedRows(processedRows);
        sessionRepository.save(session);
    }

    /**
     * Save import result after execution.
     */
    public void saveImportResult(UUID sessionId, ImportResult result) {
        ImportSession session = getSession(sessionId);
        session.setStatus(ImportSessionStatus.COMPLETED);
        try {
            session.setImportResultJson(objectMapper.writeValueAsString(result));
        } catch (Exception e) {
            log.error("Failed to serialize import result", e);
        }
        sessionRepository.save(session);
    }

    /**
     * Update a single validated row (e.g., after inline edit) and persist it.
     */
    public void updateValidatedRow(UUID sessionId, int rowIndex, ValidatedRow updatedRow) {
        List<ValidatedRow> rows = getValidatedRows(sessionId);
        if (rowIndex >= 0 && rowIndex < rows.size()) {
            rows.set(rowIndex, updatedRow);
            ImportSession session = getSession(sessionId);
            try {
                session.setValidatedRowsJson(objectMapper.writeValueAsString(rows));
            } catch (Exception e) {
                log.error("Failed to serialize updated rows", e);
            }
            session.setValidCount((int) rows.stream().filter(ValidatedRow::isValid).count());
            session.setErrorCount((int) rows.stream().filter(ValidatedRow::isInvalid).count());
            session.setDuplicateCount((int) rows.stream().filter(ValidatedRow::isDuplicate).count());
            sessionRepository.save(session);
        }
    }

    /**
     * Clean up expired sessions.
     */
    public void cleanExpiredSessions() {
        List<ImportSession> expired = sessionRepository.findByExpiresAtBefore(LocalDateTime.now());
        if (!expired.isEmpty()) {
            sessionRepository.deleteAll(expired);
            log.info("Cleaned up {} expired import sessions", expired.size());
        }
    }
}
