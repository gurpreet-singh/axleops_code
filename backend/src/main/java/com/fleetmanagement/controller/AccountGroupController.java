package com.fleetmanagement.controller;

import com.fleetmanagement.dto.response.AccountGroupResponse;
import com.fleetmanagement.service.AccountGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/account-groups")
@RequiredArgsConstructor
public class AccountGroupController {

    private final AccountGroupService accountGroupService;

    @GetMapping
    public ResponseEntity<List<AccountGroupResponse>> getAll() {
        return ResponseEntity.ok(accountGroupService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountGroupResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(accountGroupService.getById(id));
    }

    @PostMapping
    public ResponseEntity<AccountGroupResponse> create(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(accountGroupService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountGroupResponse> update(@PathVariable UUID id, @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(accountGroupService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        accountGroupService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
