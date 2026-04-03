package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.dto.request.CreateVehicleRequest;
import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Client;
import com.fleetmanagement.entity.User;
import com.fleetmanagement.entity.Vehicle;
import com.fleetmanagement.entity.master.VehicleTypeMaster;
import com.fleetmanagement.mapper.VehicleMapper;
import com.fleetmanagement.repository.BranchRepository;
import com.fleetmanagement.repository.ClientRepository;
import com.fleetmanagement.repository.UserRepository;
import com.fleetmanagement.repository.VehicleRepository;
import com.fleetmanagement.repository.master.VehicleTypeMasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final BranchRepository branchRepository;
    private final ClientRepository clientRepository;
    private final UserRepository contactRepository;
    private final VehicleTypeMasterRepository vehicleTypeMasterRepository;
    private final BranchScope branchScope;
    private final BranchValidator branchValidator;

    // ─── Read (branch-scoped) ───────────────────────────────────

    public List<VehicleResponse> getAllVehicles() {
        TenantPrincipal p = getPrincipal();
        return branchScope.queryList(p,
                vehicleRepository::findByTenantId,
                vehicleRepository::findByTenantIdAndBranchId
        ).stream().map(vehicleMapper::toResponse).toList();
    }

    public VehicleResponse getVehicleById(UUID id) {
        UUID tenantId = TenantContext.get();
        return vehicleRepository.findByIdAndTenantId(id, tenantId)
                .map(vehicleMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }

    public List<VehicleResponse> searchVehicles(String query) {
        TenantPrincipal p = getPrincipal();
        List<Vehicle> results;
        if (p.isTenantWide()) {
            results = vehicleRepository.search(p.tenantId(), query);
        } else {
            results = vehicleRepository.searchByBranch(p.tenantId(), p.branchId(), query);
        }
        return results.stream().map(vehicleMapper::toResponse).toList();
    }

    public Map<String, Long> getVehicleStats() {
        TenantPrincipal p = getPrincipal();
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", branchScope.queryCount(p,
                vehicleRepository::countByTenantId,
                vehicleRepository::countByTenantIdAndBranchId));
        stats.put("active", branchScope.queryCount(p,
                tid -> vehicleRepository.countByTenantIdAndStatus(tid, "ACTIVE"),
                (tid, bid) -> vehicleRepository.countByTenantIdAndBranchIdAndStatus(tid, bid, "ACTIVE")));
        stats.put("inactive", branchScope.queryCount(p,
                tid -> vehicleRepository.countByTenantIdAndStatus(tid, "INACTIVE"),
                (tid, bid) -> vehicleRepository.countByTenantIdAndBranchIdAndStatus(tid, bid, "INACTIVE")));
        stats.put("inMaintenance", branchScope.queryCount(p,
                tid -> vehicleRepository.countByTenantIdAndStatus(tid, "IN_MAINTENANCE"),
                (tid, bid) -> vehicleRepository.countByTenantIdAndBranchIdAndStatus(tid, bid, "IN_MAINTENANCE")));
        stats.put("sold", branchScope.queryCount(p,
                tid -> vehicleRepository.countByTenantIdAndStatus(tid, "SOLD"),
                (tid, bid) -> vehicleRepository.countByTenantIdAndBranchIdAndStatus(tid, bid, "SOLD")));
        return stats;
    }

    // ─── Create (with branch resolution) ────────────────────────

    @Transactional
    public VehicleResponse createVehicle(CreateVehicleRequest request) {
        TenantPrincipal p = getPrincipal();
        UUID tenantId = p.tenantId();

        // Validate uniqueness of registration number within tenant
        vehicleRepository.findByRegistrationNumberAndTenantId(request.getRegistrationNumber(), tenantId)
                .ifPresent(v -> {
                    throw new IllegalArgumentException(
                            "Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
                });

        Vehicle vehicle = vehicleMapper.toEntity(request);
        vehicle.setTenantId(tenantId);

        if (vehicle.getStatus() == null || vehicle.getStatus().isBlank()) {
            vehicle.setStatus("ACTIVE");
        }

        // Resolve branch via BranchValidator
        UUID resolvedBranchId = branchValidator.resolve(p, request.getBranchId());
        Branch branch = branchRepository.findById(resolvedBranchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch", resolvedBranchId));
        vehicle.setBranch(branch);

        resolveOtherForeignKeys(vehicle, request, tenantId);

        return vehicleMapper.toResponse(vehicleRepository.save(vehicle));
    }

    // ─── Update ─────────────────────────────────────────────────

    @Transactional
    public VehicleResponse updateVehicle(UUID id, CreateVehicleRequest request) {
        UUID tenantId = TenantContext.get();
        Vehicle vehicle = vehicleRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));

        // If registration number is changing, validate uniqueness
        if (request.getRegistrationNumber() != null
                && !request.getRegistrationNumber().equals(vehicle.getRegistrationNumber())) {
            vehicleRepository.findByRegistrationNumberAndTenantId(request.getRegistrationNumber(), tenantId)
                    .ifPresent(v -> {
                        throw new IllegalArgumentException(
                                "Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
                    });
        }

        vehicleMapper.updateEntity(request, vehicle);

        // Resolve branch FK
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findByIdAndTenantId(request.getBranchId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", request.getBranchId()));
            vehicle.setBranch(branch);
        }

        resolveOtherForeignKeys(vehicle, request, tenantId);

        return vehicleMapper.toResponse(vehicleRepository.save(vehicle));
    }

    // ─── Delete (soft) ──────────────────────────────────────────

    @Transactional
    public void deleteVehicle(UUID id) {
        UUID tenantId = TenantContext.get();
        Vehicle vehicle = vehicleRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        vehicle.setStatus("SCRAPPED");
        vehicleRepository.save(vehicle);
    }

    // ─── Private helpers ────────────────────────────────────────

    private void resolveOtherForeignKeys(Vehicle vehicle, CreateVehicleRequest request, UUID tenantId) {
        // Vehicle Type Master
        if (request.getVehicleTypeId() != null) {
            VehicleTypeMaster vtm = vehicleTypeMasterRepository.findByIdAndTenantId(request.getVehicleTypeId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("VehicleTypeMaster", request.getVehicleTypeId()));
            vehicle.setVehicleTypeMaster(vtm);
        } else {
            vehicle.setVehicleTypeMaster(null);
        }

        // Client (owner)
        if (request.getClientId() != null) {
            Client client = clientRepository.findByIdAndTenantId(request.getClientId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
            vehicle.setClient(client);
        } else {
            vehicle.setClient(null);
        }

        // Operator (User)
        if (request.getOperatorId() != null) {
            User operator = contactRepository.findByIdAndTenantId(request.getOperatorId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.getOperatorId()));
            vehicle.setOperator(operator);
        } else {
            vehicle.setOperator(null);
        }
    }

    private TenantPrincipal getPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof TenantPrincipal tp) {
            return tp;
        }
        // Fallback: create a tenant-wide principal from TenantContext
        UUID tenantId = TenantContext.get();
        return new TenantPrincipal(null, tenantId, null);
    }
}
