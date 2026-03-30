package com.fleetmanagement.service;

import com.fleetmanagement.config.BranchInUseException;
import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.dto.request.CreateBranchRequest;
import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.TripStatus;
import com.fleetmanagement.entity.User;
import com.fleetmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Branch management service.
 * Handles CRUD, deactivation guard, and the auto-creation of the HQ branch
 * for new tenants.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BranchService {

    private final BranchRepository branchRepo;
    private final VehicleRepository vehicleRepo;
    private final ContactRepository contactRepo;
    private final TripRepository tripRepo;
    private final UserRepository userRepo;

    // ─── Read ───────────────────────────────────────────────────

    public List<BranchResponse> getAllBranches(UUID tenantId) {
        return branchRepo.findByTenantIdAndActiveTrueOrderBySortOrderAsc(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BranchResponse> getAllBranchesIncludingInactive(UUID tenantId) {
        return branchRepo.findByTenantId(tenantId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BranchResponse getBranchById(UUID id, UUID tenantId) {
        Branch branch = branchRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", id));
        return toResponse(branch);
    }

    public long getBranchCount(UUID tenantId) {
        return branchRepo.countByTenantIdAndActiveTrue(tenantId);
    }

    // ─── Create ─────────────────────────────────────────────────

    @Transactional
    public BranchResponse createBranch(CreateBranchRequest request, TenantPrincipal principal) {
        UUID tenantId = principal.tenantId();

        // Validate unique code
        if (branchRepo.existsByTenantIdAndCode(tenantId, request.getCode())) {
            throw new IllegalArgumentException("Branch code '" + request.getCode() + "' already exists");
        }

        // Validate unique name
        if (branchRepo.existsByTenantIdAndName(tenantId, request.getName())) {
            throw new IllegalArgumentException("Branch name '" + request.getName() + "' already exists");
        }

        Branch branch = new Branch();
        branch.setTenantId(tenantId);
        branch.setCode(request.getCode().toUpperCase().trim());
        branch.setName(request.getName().trim());
        branch.setCity(request.getCity());
        branch.setState(request.getState());
        branch.setStateCode(request.getStateCode());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        branch.setGstin(request.getGstin());
        branch.setManagerId(request.getManagerId());
        branch.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        branch.setCreatedBy(principal.userId());

        // Handle headquarters flag
        if (request.isHeadquarters()) {
            // Unset existing HQ
            branchRepo.findByTenantIdAndHeadquartersTrue(tenantId)
                    .ifPresent(existingHq -> {
                        existingHq.setHeadquarters(false);
                        branchRepo.save(existingHq);
                    });
            branch.setHeadquarters(true);
        }

        return toResponse(branchRepo.save(branch));
    }

    // ─── Update ─────────────────────────────────────────────────

    @Transactional
    public BranchResponse updateBranch(UUID id, CreateBranchRequest request, TenantPrincipal principal) {
        UUID tenantId = principal.tenantId();
        Branch branch = branchRepo.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", id));

        // Validate unique code (if changed)
        if (!branch.getCode().equals(request.getCode().toUpperCase().trim())
                && branchRepo.existsByTenantIdAndCode(tenantId, request.getCode().toUpperCase().trim())) {
            throw new IllegalArgumentException("Branch code '" + request.getCode() + "' already exists");
        }

        // Validate unique name (if changed)
        if (!branch.getName().equals(request.getName().trim())
                && branchRepo.existsByTenantIdAndName(tenantId, request.getName().trim())) {
            throw new IllegalArgumentException("Branch name '" + request.getName() + "' already exists");
        }

        branch.setCode(request.getCode().toUpperCase().trim());
        branch.setName(request.getName().trim());
        branch.setCity(request.getCity());
        branch.setState(request.getState());
        branch.setStateCode(request.getStateCode());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        branch.setGstin(request.getGstin());
        branch.setManagerId(request.getManagerId());
        if (request.getSortOrder() != null) {
            branch.setSortOrder(request.getSortOrder());
        }

        // Handle headquarters flag
        if (request.isHeadquarters() && !branch.isHeadquarters()) {
            branchRepo.findByTenantIdAndHeadquartersTrue(tenantId)
                    .ifPresent(existingHq -> {
                        existingHq.setHeadquarters(false);
                        branchRepo.save(existingHq);
                    });
            branch.setHeadquarters(true);
        }

        return toResponse(branchRepo.save(branch));
    }

    // ─── Deactivate ─────────────────────────────────────────────

    @Transactional
    public void deactivateBranch(UUID branchId, UUID tenantId) {
        Branch branch = branchRepo.findByIdAndTenantId(branchId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", branchId));

        if (branch.isHeadquarters()) {
            throw new IllegalArgumentException("Cannot deactivate headquarters branch");
        }

        long vehicles = vehicleRepo.countByBranchIdAndStatus(branchId, "ACTIVE");
        long drivers = contactRepo.countByBranchIdAndStatus(branchId, "ACTIVE");
        long trips = tripRepo.countByBranchIdAndStatusIn(branchId,
                List.of(TripStatus.CREATED, TripStatus.IN_TRANSIT));

        if (vehicles + drivers + trips > 0) {
            throw new BranchInUseException(branchId, vehicles, drivers, trips);
        }

        branch.setActive(false);
        branchRepo.save(branch);
    }

    // ─── Auto-create HQ for new tenants ─────────────────────────

    @Transactional
    public Branch ensureHqBranch(UUID tenantId) {
        return branchRepo.findByTenantIdAndHeadquartersTrue(tenantId)
                .orElseGet(() -> {
                    Branch hq = new Branch();
                    hq.setTenantId(tenantId);
                    hq.setCode("HQ");
                    hq.setName("Head Office");
                    hq.setHeadquarters(true);
                    hq.setActive(true);
                    hq.setSortOrder(0);
                    return branchRepo.save(hq);
                });
    }

    // ─── Response mapper ────────────────────────────────────────

    private BranchResponse toResponse(Branch b) {
        // Resolve manager name if set
        String managerName = null;
        if (b.getManagerId() != null) {
            managerName = userRepo.findById(b.getManagerId())
                    .map(User::getFullName)
                    .orElse(null);
        }

        return BranchResponse.builder()
                .id(b.getId())
                .code(b.getCode())
                .name(b.getName())
                .city(b.getCity())
                .state(b.getState())
                .stateCode(b.getStateCode())
                .address(b.getAddress())
                .phone(b.getPhone())
                .email(b.getEmail())
                .gstin(b.getGstin())
                .managerId(b.getManagerId())
                .managerName(managerName)
                .headquarters(b.isHeadquarters())
                .active(b.isActive())
                .sortOrder(b.getSortOrder())
                .vehicleCount(vehicleRepo.countByBranchIdAndStatus(b.getId(), "ACTIVE"))
                .driverCount(contactRepo.countByBranchIdAndStatus(b.getId(), "ACTIVE"))
                .tripCount(tripRepo.countByBranchIdAndStatusIn(b.getId(),
                        List.of(TripStatus.CREATED, TripStatus.IN_TRANSIT)))
                .build();
    }
}
