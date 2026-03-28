package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.LedgerGroupResponse;
import com.fleetmanagement.service.LedgerGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ledger-groups")
@RequiredArgsConstructor
public class LedgerGroupController {

    private final LedgerGroupService ledgerGroupService;

    @GetMapping
    public ResponseEntity<List<LedgerGroupResponse>> getAll() {
        return ResponseEntity.ok(ledgerGroupService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LedgerGroupResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ledgerGroupService.getById(id));
    }

    @PostMapping
    public ResponseEntity<LedgerGroupResponse> create(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ledgerGroupService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LedgerGroupResponse> update(@PathVariable UUID id, @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ledgerGroupService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ledgerGroupService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
