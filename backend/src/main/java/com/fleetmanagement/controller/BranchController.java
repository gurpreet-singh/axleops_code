package com.fleetmanagement.controller;

import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.dto.request.CreateBranchRequest;
import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        UUID tenantId = TenantContext.get();
        return ResponseEntity.ok(branchService.getAllBranches(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getBranchById(@PathVariable UUID id) {
        UUID tenantId = TenantContext.get();
        return ResponseEntity.ok(branchService.getBranchById(id, tenantId));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getBranchCount() {
        UUID tenantId = TenantContext.get();
        return ResponseEntity.ok(Map.of("count", branchService.getBranchCount(tenantId)));
    }

    @PostMapping
    public ResponseEntity<BranchResponse> createBranch(@RequestBody CreateBranchRequest request) {
        TenantPrincipal principal = getPrincipal();
        return ResponseEntity.ok(branchService.createBranch(request, principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BranchResponse> updateBranch(@PathVariable UUID id,
                                                        @RequestBody CreateBranchRequest request) {
        TenantPrincipal principal = getPrincipal();
        return ResponseEntity.ok(branchService.updateBranch(id, request, principal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateBranch(@PathVariable UUID id) {
        UUID tenantId = TenantContext.get();
        branchService.deactivateBranch(id, tenantId);
        return ResponseEntity.noContent().build();
    }

    private TenantPrincipal getPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (TenantPrincipal) auth.getPrincipal();
    }
}
