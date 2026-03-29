package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // ─── Dashboard ──────────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/maintenance/dashboard")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getVehicleMaintenanceDashboard(vehicleId));
    }

    // ─── Service Tasks ──────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/service-tasks")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getServiceTasks(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getServiceTasks(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/service-tasks")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createServiceTask(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.createServiceTask(vehicleId, data));
    }

    @PutMapping("/service-tasks/{taskId}/complete")
    @RequiresAuthority(Authority.VEHICLE_UPDATE)
    public ResponseEntity<Map<String, Object>> completeServiceTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(maintenanceService.completeServiceTask(taskId));
    }

    @DeleteMapping("/service-tasks/{taskId}")
    @RequiresAuthority(Authority.VEHICLE_DELETE)
    public ResponseEntity<Void> deleteServiceTask(@PathVariable UUID taskId) {
        maintenanceService.deleteServiceTask(taskId);
        return ResponseEntity.noContent().build();
    }

    // ─── Issues ─────────────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/issues")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getIssues(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getIssues(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/issues")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createIssue(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.createIssue(vehicleId, data));
    }

    @PutMapping("/issues/{issueId}/status")
    @RequiresAuthority(Authority.VEHICLE_UPDATE)
    public ResponseEntity<Map<String, Object>> updateIssueStatus(
            @PathVariable UUID issueId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.updateIssueStatus(
                issueId, (String) data.get("status"), (String) data.get("notes")));
    }

    // ─── Inspections ────────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/inspections")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getInspections(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getInspections(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/inspections")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createInspection(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.createInspection(vehicleId, data));
    }

    // ─── Health Score ───────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/health-score")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Object>> getHealthScore(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getHealthScore(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/health-score/compute")
    @RequiresAuthority(Authority.VEHICLE_UPDATE)
    public ResponseEntity<Map<String, Object>> computeHealthScore(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.computeHealthScore(vehicleId));
    }

    // ─── Loans ──────────────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/loans")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getLoans(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getLoans(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/loans")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createLoan(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.createLoan(vehicleId, data));
    }

    // ─── Warranties ─────────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/warranties")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getWarranties(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getWarranties(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/warranties")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createWarranty(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.createWarranty(vehicleId, data));
    }

    // ─── Cost Entries ───────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/costs")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getCostEntries(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getCostEntries(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/costs")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createCostEntry(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(maintenanceService.createCostEntry(vehicleId, data));
    }

    @GetMapping("/vehicles/{vehicleId}/costs/summary")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Object>> getCostSummary(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(maintenanceService.getCostSummary(vehicleId));
    }
}
