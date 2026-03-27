package com.fleetmanagement.controller;

import com.fleetmanagement.dto.request.CreateTenantAdminRequest;
import com.fleetmanagement.dto.request.CreateTenantRequest;
import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.dto.response.TenantResponse;
import com.fleetmanagement.dto.response.TenantUserResponse;
import com.fleetmanagement.service.PlatformAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/platform")
@RequiredArgsConstructor
public class PlatformAdminController {

    private final PlatformAdminService platformAdminService;

    // ─── Tenant Operations ─────────────────────────────────

    /**
     * GET /api/v1/platform/tenants — List all tenants
     */
    @GetMapping("/tenants")
    public ResponseEntity<List<TenantResponse>> getAllTenants() {
        return ResponseEntity.ok(platformAdminService.getAllTenants());
    }

    /**
     * GET /api/v1/platform/tenants/{id} — Get single tenant detail
     */
    @GetMapping("/tenants/{id}")
    public ResponseEntity<TenantResponse> getTenantById(@PathVariable UUID id) {
        return ResponseEntity.ok(platformAdminService.getTenantById(id));
    }

    /**
     * POST /api/v1/platform/tenants — Create new tenant with branch and admin
     */
    @PostMapping("/tenants")
    public ResponseEntity<TenantResponse> createTenant(@RequestBody CreateTenantRequest request) {
        TenantResponse tenant = platformAdminService.createTenant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }

    // ─── Tenant User Operations ────────────────────────────

    /**
     * GET /api/v1/platform/tenants/{id}/users — List users for a tenant
     */
    @GetMapping("/tenants/{id}/users")
    public ResponseEntity<List<TenantUserResponse>> getTenantUsers(@PathVariable UUID id) {
        return ResponseEntity.ok(platformAdminService.getTenantUsers(id));
    }

    /**
     * POST /api/v1/platform/tenants/{id}/admins — Add system admin to tenant
     */
    @PostMapping("/tenants/{id}/admins")
    public ResponseEntity<TenantUserResponse> addTenantAdmin(
            @PathVariable UUID id,
            @RequestBody CreateTenantAdminRequest request) {
        request.setTenantId(id);
        TenantUserResponse user = platformAdminService.addTenantAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    // ─── Tenant Branch Operations ──────────────────────────

    /**
     * GET /api/v1/platform/tenants/{id}/branches — List branches for a tenant
     */
    @GetMapping("/tenants/{id}/branches")
    public ResponseEntity<List<BranchResponse>> getTenantBranches(@PathVariable UUID id) {
        return ResponseEntity.ok(platformAdminService.getTenantBranches(id));
    }
}
