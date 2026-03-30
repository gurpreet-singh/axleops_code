package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.request.CreateComplianceDocumentRequest;
import com.fleetmanagement.dto.response.ComplianceDashboardResponse;
import com.fleetmanagement.dto.response.ComplianceDocumentResponse;
import com.fleetmanagement.entity.ComplianceDocument;
import com.fleetmanagement.entity.Vehicle;
import com.fleetmanagement.repository.ComplianceDocumentRepository;
import com.fleetmanagement.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ComplianceDocumentService {

    private final ComplianceDocumentRepository complianceRepo;
    private final VehicleRepository vehicleRepository;

    private static final List<String> DOCUMENT_TYPES = List.of(
            "RC", "PERMIT", "PUC", "PASSING", "INSURANCE", "ROAD_TAX",
            "GREEN_TAX", "AUTHORITY", "CFRA", "PTI", "FASTAG", "PROFESSION_TAX"
    );

    // ─── Read Operations ────────────────────────────────────────

    /**
     * Get all compliance documents for a vehicle.
     * Optionally filter by type and/or is_current.
     */
    public List<ComplianceDocumentResponse> getVehicleCompliance(UUID vehicleId, String type, Boolean currentOnly) {
        UUID tenantId = TenantContext.get();

        List<ComplianceDocument> docs;
        if (type != null && !type.isBlank()) {
            docs = complianceRepo.findByVehicleIdAndTenantIdAndDocumentType(vehicleId, tenantId, type.toUpperCase());
        } else if (Boolean.TRUE.equals(currentOnly)) {
            docs = complianceRepo.findByVehicleIdAndTenantIdAndIsCurrentTrue(vehicleId, tenantId);
        } else {
            docs = complianceRepo.findByVehicleIdAndTenantId(vehicleId, tenantId);
        }

        return docs.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get a single compliance document by ID.
     */
    public ComplianceDocumentResponse getById(UUID docId) {
        UUID tenantId = TenantContext.get();
        ComplianceDocument doc = complianceRepo.findByIdAndTenantId(docId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceDocument", docId));
        return toResponse(doc);
    }

    /**
     * Get the version history for a specific document type on a vehicle.
     */
    public List<ComplianceDocumentResponse> getVersionHistory(UUID vehicleId, String documentType) {
        UUID tenantId = TenantContext.get();
        return complianceRepo.findVersionHistory(tenantId, vehicleId, documentType.toUpperCase()).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Fleet-level compliance dashboard.
     */
    public ComplianceDashboardResponse getDashboard() {
        UUID tenantId = TenantContext.get();
        LocalDate today = LocalDate.now();
        LocalDate cutoff30 = today.plusDays(30);

        List<ComplianceDocument> allCurrent = complianceRepo.findByTenantId(tenantId).stream()
                .filter(d -> Boolean.TRUE.equals(d.getIsCurrent()))
                .toList();

        ComplianceDashboardResponse resp = new ComplianceDashboardResponse();
        resp.setTotalDocuments(allCurrent.size());

        long active = 0, expiringSoon = 0, expired = 0;
        Map<String, ComplianceDashboardResponse.TypeSummary> byType = new LinkedHashMap<>();

        for (String type : DOCUMENT_TYPES) {
            byType.put(type, new ComplianceDashboardResponse.TypeSummary());
        }

        for (ComplianceDocument doc : allCurrent) {
            String expiryStatus = computeExpiryStatus(doc, today);
            ComplianceDashboardResponse.TypeSummary ts = byType.computeIfAbsent(doc.getDocumentType(), k -> new ComplianceDashboardResponse.TypeSummary());

            ts.setTotal(ts.getTotal() + 1);
            switch (expiryStatus) {
                case "ACTIVE" -> { active++; ts.setActive(ts.getActive() + 1); }
                case "EXPIRING_SOON" -> { expiringSoon++; ts.setExpiringSoon(ts.getExpiringSoon() + 1); }
                case "EXPIRED" -> { expired++; ts.setExpired(ts.getExpired() + 1); }
            }
        }

        resp.setActiveDocuments(active);
        resp.setExpiringSoonDocuments(expiringSoon);
        resp.setExpiredDocuments(expired);
        resp.setByType(byType);

        // Expiring in next 30 days
        List<ComplianceDocumentResponse> expiring30 = complianceRepo.findExpiringSoon(tenantId, cutoff30).stream()
                .map(this::toResponse)
                .toList();
        resp.setExpiringNext30Days(expiring30);

        return resp;
    }

    /**
     * Get all documents expiring within N days across fleet.
     */
    public List<ComplianceDocumentResponse> getExpiring(int days) {
        UUID tenantId = TenantContext.get();
        LocalDate cutoff = LocalDate.now().plusDays(days);
        return complianceRepo.findExpiringSoon(tenantId, cutoff).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Get compliance summary counts for a specific vehicle.
     */
    public Map<String, Long> getVehicleComplianceSummary(UUID vehicleId) {
        UUID tenantId = TenantContext.get();
        Map<String, Long> summary = new HashMap<>();
        summary.put("active", complianceRepo.countByVehicleIdAndTenantIdAndIsCurrentTrueAndStatus(vehicleId, tenantId, "ACTIVE"));
        summary.put("expiringSoon", complianceRepo.countByVehicleIdAndTenantIdAndIsCurrentTrueAndStatus(vehicleId, tenantId, "EXPIRING_SOON"));
        summary.put("expired", complianceRepo.countByVehicleIdAndTenantIdAndIsCurrentTrueAndStatus(vehicleId, tenantId, "EXPIRED"));
        return summary;
    }

    // ─── Create / Renew ─────────────────────────────────────────

    /**
     * Create a new compliance document (or renew an existing one).
     * If a current document of the same type exists, it is superseded.
     */
    @Transactional
    public ComplianceDocumentResponse createOrRenew(UUID vehicleId, CreateComplianceDocumentRequest request) {
        UUID tenantId = TenantContext.get();
        Vehicle vehicle = vehicleRepository.findByIdAndTenantId(vehicleId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", vehicleId));

        String docType = request.getDocumentType().toUpperCase();

        // Check for existing current document of same type → supersede it
        Optional<ComplianceDocument> currentOpt = complianceRepo
                .findByVehicleIdAndTenantIdAndDocumentTypeAndIsCurrentTrue(vehicleId, tenantId, docType);

        int nextVersion = 1;
        UUID previousId = null;
        if (currentOpt.isPresent()) {
            ComplianceDocument current = currentOpt.get();
            current.setIsCurrent(false);
            current.setStatus("SUPERSEDED");
            complianceRepo.save(current);
            nextVersion = current.getVersionNumber() + 1;
            previousId = current.getId();
        }

        // Create new compliance document
        ComplianceDocument doc = new ComplianceDocument();
        doc.setTenantId(tenantId);
        doc.setVehicle(vehicle);
        doc.setBranch(vehicle.getBranch());
        doc.setDocumentType(docType);
        doc.setDocumentNumber(request.getDocumentNumber());
        doc.setStatus(computeInitialStatus(request));
        doc.setEffectiveFrom(request.getEffectiveFrom());
        doc.setEffectiveTo(request.getEffectiveTo());
        doc.setIssuedDate(request.getIssuedDate());
        doc.setAmount(request.getAmount());
        doc.setVersionNumber(nextVersion);
        doc.setIsCurrent(true);
        doc.setPreviousVersionId(previousId);
        doc.setRenewalSource(previousId != null ? "MANUAL" : null);
        doc.setNotes(request.getNotes());

        ComplianceDocument saved = complianceRepo.save(doc);

        return toResponse(saved);
    }

    // ─── Update ─────────────────────────────────────────────────

    @Transactional
    public ComplianceDocumentResponse update(UUID docId, CreateComplianceDocumentRequest request) {
        UUID tenantId = TenantContext.get();
        ComplianceDocument doc = complianceRepo.findByIdAndTenantId(docId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceDocument", docId));

        doc.setDocumentNumber(request.getDocumentNumber());
        doc.setEffectiveFrom(request.getEffectiveFrom());
        doc.setEffectiveTo(request.getEffectiveTo());
        doc.setIssuedDate(request.getIssuedDate());
        doc.setAmount(request.getAmount());
        doc.setNotes(request.getNotes());

        // Recompute status
        doc.setStatus(computeExpiryStatus(doc, LocalDate.now()));

        ComplianceDocument saved = complianceRepo.save(doc);

        return toResponse(saved);
    }

    // ─── Delete (Cancel) ────────────────────────────────────────

    @Transactional
    public void cancel(UUID docId) {
        UUID tenantId = TenantContext.get();
        ComplianceDocument doc = complianceRepo.findByIdAndTenantId(docId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("ComplianceDocument", docId));
        doc.setStatus("CANCELLED");
        doc.setIsCurrent(false);
        complianceRepo.save(doc);
    }

    // ─── Scheduled: Update Expiry Statuses ──────────────────────

    /**
     * Called by a scheduled job to update ACTIVE docs that have expired.
     */
    @Transactional
    public int updateExpiredStatuses() {
        // Process all tenants — in a real system, iterate tenant list
        // For now, find all expired-but-not-marked docs and update
        List<ComplianceDocument> expired = complianceRepo.findExpiredButNotMarked(TenantContext.get(), LocalDate.now());
        for (ComplianceDocument doc : expired) {
            doc.setStatus("EXPIRED");
        }
        complianceRepo.saveAll(expired);
        return expired.size();
    }

    // ─── Private Helpers ────────────────────────────────────────

    private ComplianceDocumentResponse toResponse(ComplianceDocument doc) {
        ComplianceDocumentResponse resp = new ComplianceDocumentResponse();
        resp.setId(doc.getId());
        resp.setVehicleId(doc.getVehicle().getId());
        resp.setVehicleRegistrationNumber(doc.getVehicle().getRegistrationNumber());
        resp.setDocumentType(doc.getDocumentType());
        resp.setDocumentNumber(doc.getDocumentNumber());
        resp.setStatus(doc.getStatus());
        resp.setEffectiveFrom(doc.getEffectiveFrom());
        resp.setEffectiveTo(doc.getEffectiveTo());
        resp.setIssuedDate(doc.getIssuedDate());
        resp.setAmount(doc.getAmount());
        resp.setVersionNumber(doc.getVersionNumber());
        resp.setIsCurrent(doc.getIsCurrent());
        resp.setPreviousVersionId(doc.getPreviousVersionId());
        resp.setRenewalSource(doc.getRenewalSource());
        resp.setNotes(doc.getNotes());

        // Compute days remaining and expiry status
        LocalDate today = LocalDate.now();
        if (doc.getEffectiveTo() != null) {
            long days = ChronoUnit.DAYS.between(today, doc.getEffectiveTo());
            resp.setDaysRemaining(days);
            resp.setExpiryStatus(computeExpiryStatus(doc, today));
        } else {
            resp.setDaysRemaining(null);
            resp.setExpiryStatus("ACTIVE");
        }

        return resp;
    }

    private String computeExpiryStatus(ComplianceDocument doc, LocalDate today) {
        if ("CANCELLED".equals(doc.getStatus()) || "SUPERSEDED".equals(doc.getStatus())) {
            return doc.getStatus();
        }
        if (doc.getEffectiveTo() == null) return "ACTIVE";
        long days = ChronoUnit.DAYS.between(today, doc.getEffectiveTo());
        if (days < 0) return "EXPIRED";
        if (days <= 30) return "EXPIRING_SOON";
        return "ACTIVE";
    }

    private String computeInitialStatus(CreateComplianceDocumentRequest request) {
        if (request.getEffectiveTo() == null) return "ACTIVE";
        long days = ChronoUnit.DAYS.between(LocalDate.now(), request.getEffectiveTo());
        if (days < 0) return "EXPIRED";
        if (days <= 30) return "EXPIRING_SOON";
        return "ACTIVE";
    }
}
