package com.fleetmanagement.controller;

import com.fleetmanagement.entity.InvoiceType;
import com.fleetmanagement.service.InvoiceTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/invoice-types")
@RequiredArgsConstructor
public class InvoiceTypeController {

    private final InvoiceTypeService service;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(service.getAll().stream()
                .map(it -> Map.<String, Object>of("id", it.getId(), "name", it.getName()))
                .toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, String> body) {
        InvoiceType it = service.create(body.get("name"));
        return ResponseEntity.ok(Map.of("id", it.getId(), "name", it.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        InvoiceType it = service.update(id, body.get("name"));
        return ResponseEntity.ok(Map.of("id", it.getId(), "name", it.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
