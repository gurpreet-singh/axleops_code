package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.request.CreateComplianceDocumentRequest;
import com.fleetmanagement.dto.response.ComplianceDashboardResponse;
import com.fleetmanagement.dto.response.ComplianceDocumentResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.ComplianceDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceDocumentService complianceService;

    // ─── Vehicle-Level Endpoints ────────────────────────────────

    /**
     * GET /vehicles/{vehicleId}/compliance
     * Query params: type (optional), current (optional, default=true)
     */
    @GetMapping("/vehicles/{vehicleId}/compliance")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<ComplianceDocumentResponse>> getVehicleCompliance(
            @PathVariable UUID vehicleId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false, defaultValue = "true") Boolean current) {
        return ResponseEntity.ok(complianceService.getVehicleCompliance(vehicleId, type, current));
    }

    /**
     * GET /vehicles/{vehicleId}/compliance/summary
     * Returns { active: N, expiringSoon: N, expired: N }
     */
    @GetMapping("/vehicles/{vehicleId}/compliance/summary")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Long>> getVehicleComplianceSummary(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(complianceService.getVehicleComplianceSummary(vehicleId));
    }

    /**
     * POST /vehicles/{vehicleId}/compliance
     * Creates or renews a compliance document.
     */
    @PostMapping("/vehicles/{vehicleId}/compliance")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<ComplianceDocumentResponse> createOrRenew(
            @PathVariable UUID vehicleId,
            @RequestBody CreateComplianceDocumentRequest request) {
        return ResponseEntity.ok(complianceService.createOrRenew(vehicleId, request));
    }

    /**
     * GET /vehicles/{vehicleId}/compliance/history?type=INSURANCE
     * Returns version chain for a document type.
     */
    @GetMapping("/vehicles/{vehicleId}/compliance/history")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<ComplianceDocumentResponse>> getVersionHistory(
            @PathVariable UUID vehicleId,
            @RequestParam String type) {
        return ResponseEntity.ok(complianceService.getVersionHistory(vehicleId, type));
    }

    // ─── Document-Level Endpoints ───────────────────────────────

    /**
     * GET /compliance/{docId}
     * Get a single compliance document by ID.
     */
    @GetMapping("/compliance/{docId}")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<ComplianceDocumentResponse> getById(@PathVariable UUID docId) {
        return ResponseEntity.ok(complianceService.getById(docId));
    }

    /**
     * PUT /compliance/{docId}
     * Update a compliance document.
     */
    @PutMapping("/compliance/{docId}")
    @RequiresAuthority(Authority.VEHICLE_UPDATE)
    public ResponseEntity<ComplianceDocumentResponse> update(
            @PathVariable UUID docId,
            @RequestBody CreateComplianceDocumentRequest request) {
        return ResponseEntity.ok(complianceService.update(docId, request));
    }

    /**
     * DELETE /compliance/{docId}
     * Cancel (soft-delete) a compliance document.
     */
    @DeleteMapping("/compliance/{docId}")
    @RequiresAuthority(Authority.VEHICLE_DELETE)
    public ResponseEntity<Void> cancel(@PathVariable UUID docId) {
        complianceService.cancel(docId);
        return ResponseEntity.noContent().build();
    }

    // ─── Fleet-Level Endpoints ──────────────────────────────────

    /**
     * GET /fleet/compliance-dashboard
     * Fleet-wide compliance overview with per-type breakdowns.
     */
    @GetMapping("/fleet/compliance-dashboard")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<ComplianceDashboardResponse> getDashboard() {
        return ResponseEntity.ok(complianceService.getDashboard());
    }

    /**
     * GET /fleet/expiring?days=30
     * All documents expiring within N days across fleet.
     */
    @GetMapping("/fleet/expiring")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<ComplianceDocumentResponse>> getExpiring(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(complianceService.getExpiring(days));
    }
}
