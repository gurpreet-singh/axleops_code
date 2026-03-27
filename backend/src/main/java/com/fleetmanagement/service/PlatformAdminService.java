package com.fleetmanagement.service;

import com.fleetmanagement.dto.request.CreateTenantAdminRequest;
import com.fleetmanagement.dto.request.CreateTenantRequest;
import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.dto.response.TenantResponse;
import com.fleetmanagement.dto.response.TenantUserResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Tenant;
import com.fleetmanagement.entity.User;
import com.fleetmanagement.mapper.BranchMapper;
import com.fleetmanagement.mapper.TenantMapper;
import com.fleetmanagement.repository.BranchRepository;
import com.fleetmanagement.repository.TenantRepository;
import com.fleetmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlatformAdminService {

    private final TenantRepository tenantRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final TenantMapper tenantMapper;
    private final BranchMapper branchMapper;

    /**
     * List all tenants with aggregated counts
     */
    @Transactional(readOnly = true)
    public List<TenantResponse> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(tenant -> {
                    TenantResponse resp = tenantMapper.toResponse(tenant);
                    resp.setBranchCount(branchRepository.findByTenantId(tenant.getId()).size());
                    resp.setUserCount(userRepository.findByTenantId(tenant.getId()).size());
                    return resp;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get single tenant detail
     */
    @Transactional(readOnly = true)
    public TenantResponse getTenantById(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));
        TenantResponse resp = tenantMapper.toResponse(tenant);
        resp.setBranchCount(branchRepository.findByTenantId(tenant.getId()).size());
        resp.setUserCount(userRepository.findByTenantId(tenant.getId()).size());
        return resp;
    }

    /**
     * Create a new tenant with primary branch and initial system admin user
     */
    @Transactional
    public TenantResponse createTenant(CreateTenantRequest request) {
        // 1. Create Tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setTradeName(request.getTradeName());
        tenant.setGstin(request.getGstin());
        tenant.setPan(request.getPan());
        tenant.setAddress(request.getAddress());
        tenant.setCity(request.getCity());
        tenant.setState(request.getState());
        tenant.setPhone(request.getPhone());
        tenant.setEmail(request.getEmail());
        tenant.setStatus("ACTIVE");
        tenant = tenantRepository.save(tenant);

        // 2. Create Primary Branch
        Branch primaryBranch = new Branch();
        primaryBranch.setId(UUID.randomUUID());
        primaryBranch.setTenantId(tenant.getId());
        primaryBranch.setName(request.getPrimaryBranchName() != null ? request.getPrimaryBranchName() : request.getCity() + " HQ");
        primaryBranch.setCity(request.getPrimaryBranchCity() != null ? request.getPrimaryBranchCity() : request.getCity());
        primaryBranch.setState(request.getPrimaryBranchState() != null ? request.getPrimaryBranchState() : request.getState());
        primaryBranch.setIsPrimary(true);
        primaryBranch.setStatus("ACTIVE");
        primaryBranch = branchRepository.save(primaryBranch);

        // 3. Create System Admin User for this tenant
        if (request.getAdminEmail() != null && !request.getAdminEmail().isEmpty()) {
            User admin = new User();
            admin.setId(UUID.randomUUID());
            admin.setTenantId(tenant.getId());
            admin.setFirstName(request.getAdminFirstName());
            admin.setLastName(request.getAdminLastName());
            admin.setEmail(request.getAdminEmail());
            admin.setPassword(request.getAdminPassword());
            admin.setRole("OWNER");
            admin.setTitle(request.getAdminTitle() != null ? request.getAdminTitle() : "System Administrator");
            admin.setBranch(primaryBranch);
            admin.setStatus("ACTIVE");
            userRepository.save(admin);
        }

        TenantResponse resp = tenantMapper.toResponse(tenant);
        resp.setBranchCount(1);
        resp.setUserCount(request.getAdminEmail() != null ? 1 : 0);
        return resp;
    }

    /**
     * Get all users for a specific tenant
     */
    @Transactional(readOnly = true)
    public List<TenantUserResponse> getTenantUsers(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        return userRepository.findByTenantId(tenantId).stream()
                .map(user -> {
                    TenantUserResponse resp = new TenantUserResponse();
                    resp.setId(user.getId());
                    resp.setFirstName(user.getFirstName());
                    resp.setLastName(user.getLastName());
                    resp.setEmail(user.getEmail());
                    resp.setPhone(user.getPhone());
                    resp.setRole(user.getRole());
                    resp.setTitle(user.getTitle());
                    resp.setStatus(user.getStatus());
                    resp.setTenantId(tenantId);
                    resp.setTenantName(tenant.getName());
                    if (user.getBranch() != null) {
                        resp.setBranchId(user.getBranch().getId());
                        resp.setBranchName(user.getBranch().getName());
                    }
                    return resp;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all branches for a specific tenant
     */
    @Transactional(readOnly = true)
    public List<BranchResponse> getTenantBranches(UUID tenantId) {
        return branchRepository.findByTenantId(tenantId).stream()
                .map(branchMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Add a system admin user to an existing tenant
     */
    @Transactional
    public TenantUserResponse addTenantAdmin(CreateTenantAdminRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + request.getTenantId()));

        // Find primary branch or first branch
        List<Branch> branches = branchRepository.findByTenantId(request.getTenantId());
        Branch targetBranch = branches.stream()
                .filter(b -> Boolean.TRUE.equals(b.getIsPrimary()))
                .findFirst()
                .orElse(branches.isEmpty() ? null : branches.get(0));

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setTenantId(request.getTenantId());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole("OWNER");
        user.setTitle(request.getTitle() != null ? request.getTitle() : "System Administrator");
        user.setPhone(request.getPhone());
        user.setBranch(targetBranch);
        user.setStatus("ACTIVE");
        user = userRepository.save(user);

        TenantUserResponse resp = new TenantUserResponse();
        resp.setId(user.getId());
        resp.setFirstName(user.getFirstName());
        resp.setLastName(user.getLastName());
        resp.setEmail(user.getEmail());
        resp.setPhone(user.getPhone());
        resp.setRole(user.getRole());
        resp.setTitle(user.getTitle());
        resp.setStatus(user.getStatus());
        resp.setTenantId(request.getTenantId());
        resp.setTenantName(tenant.getName());
        if (targetBranch != null) {
            resp.setBranchId(targetBranch.getId());
            resp.setBranchName(targetBranch.getName());
        }
        return resp;
    }
}
