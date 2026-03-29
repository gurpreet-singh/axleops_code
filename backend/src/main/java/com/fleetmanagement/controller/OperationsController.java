package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class OperationsController {

    private final OperationsService operationsService;

    // ─── Dashboard ──────────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/operations/dashboard")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(operationsService.getOperationsDashboard(vehicleId));
    }

    // ─── Fuel Entries ───────────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/fuel-entries")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getFuelEntries(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(operationsService.getFuelEntries(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/fuel-entries")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createFuelEntry(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(operationsService.createFuelEntry(vehicleId, data));
    }

    @GetMapping("/vehicles/{vehicleId}/fuel-entries/summary")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Object>> getFuelSummary(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(operationsService.getFuelSummary(vehicleId));
    }

    // ─── Driver Assignments ─────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/driver-assignments")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getDriverAssignments(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(operationsService.getDriverAssignments(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/driver-assignments")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> assignDriver(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(operationsService.assignDriver(vehicleId, data));
    }

    @PutMapping("/driver-assignments/{assignmentId}/end")
    @RequiresAuthority(Authority.VEHICLE_UPDATE)
    public ResponseEntity<Void> endAssignment(@PathVariable UUID assignmentId) {
        operationsService.endAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }

    // ─── Vehicle Documents ──────────────────────────────────────

    @GetMapping("/vehicles/{vehicleId}/documents")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getDocuments(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(operationsService.getVehicleDocuments(vehicleId));
    }

    @PostMapping("/vehicles/{vehicleId}/documents")
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<Map<String, Object>> createDocument(
            @PathVariable UUID vehicleId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(operationsService.createVehicleDocument(vehicleId, data));
    }

    @DeleteMapping("/documents/{docId}")
    @RequiresAuthority(Authority.VEHICLE_DELETE)
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID docId) {
        operationsService.deleteDocument(docId);
        return ResponseEntity.noContent().build();
    }

    // ─── Trip History (vehicle-level) ───────────────────────────

    @GetMapping("/vehicles/{vehicleId}/trips")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<Map<String, Object>>> getVehicleTrips(@PathVariable UUID vehicleId) {
        return ResponseEntity.ok(operationsService.getVehicleTrips(vehicleId));
    }
}
