package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.request.CreateVehicleRequest;
import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @GetMapping("/{id}")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/search")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<List<VehicleResponse>> searchVehicles(@RequestParam String q) {
        return ResponseEntity.ok(vehicleService.searchVehicles(q));
    }

    @GetMapping("/stats")
    @RequiresAuthority(Authority.VEHICLE_READ)
    public ResponseEntity<Map<String, Long>> getVehicleStats() {
        return ResponseEntity.ok(vehicleService.getVehicleStats());
    }

    @PostMapping
    @RequiresAuthority(Authority.VEHICLE_CREATE)
    public ResponseEntity<VehicleResponse> createVehicle(@RequestBody CreateVehicleRequest request) {
        return ResponseEntity.ok(vehicleService.createVehicle(request));
    }

    @PutMapping("/{id}")
    @RequiresAuthority(Authority.VEHICLE_UPDATE)
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable UUID id, @RequestBody CreateVehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresAuthority(Authority.VEHICLE_DELETE)
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}
