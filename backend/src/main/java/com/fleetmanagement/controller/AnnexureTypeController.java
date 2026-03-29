package com.fleetmanagement.controller;

import com.fleetmanagement.entity.AnnexureType;
import com.fleetmanagement.service.AnnexureTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/annexure-types")
@RequiredArgsConstructor
public class AnnexureTypeController {

    private final AnnexureTypeService service;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(service.getAll().stream()
                .map(at -> Map.<String, Object>of("id", at.getId(), "name", at.getName()))
                .toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> body) {
        AnnexureType at = service.create(body.get("name"));
        return ResponseEntity.ok(Map.of("id", at.getId(), "name", at.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        AnnexureType at = service.update(id, body.get("name"));
        return ResponseEntity.ok(Map.of("id", at.getId(), "name", at.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
