package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.request.CreateVehicleRequest;
import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Client;
import com.fleetmanagement.entity.Contact;
import com.fleetmanagement.entity.Vehicle;
import com.fleetmanagement.entity.VehicleType;
import com.fleetmanagement.mapper.VehicleMapper;
import com.fleetmanagement.repository.BranchRepository;
import com.fleetmanagement.repository.ClientRepository;
import com.fleetmanagement.repository.ContactRepository;
import com.fleetmanagement.repository.VehicleRepository;
import com.fleetmanagement.repository.VehicleTypeRepository;
import lombok.RequiredArgsConstructor;
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
    private final ContactRepository contactRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    // ─── Read ───────────────────────────────────────────────────

    public List<VehicleResponse> getAllVehicles() {
        UUID tenantId = TenantContext.get();
        return vehicleRepository.findByTenantId(tenantId).stream()
                .map(vehicleMapper::toResponse)
                .toList();
    }

    public VehicleResponse getVehicleById(UUID id) {
        UUID tenantId = TenantContext.get();
        return vehicleRepository.findByIdAndTenantId(id, tenantId)
                .map(vehicleMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }

    public List<VehicleResponse> searchVehicles(String query) {
        UUID tenantId = TenantContext.get();
        return vehicleRepository.search(tenantId, query).stream()
                .map(vehicleMapper::toResponse)
                .toList();
    }

    public Map<String, Long> getVehicleStats() {
        UUID tenantId = TenantContext.get();
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", vehicleRepository.countByTenantId(tenantId));
        stats.put("active", vehicleRepository.countByTenantIdAndStatus(tenantId, "ACTIVE"));
        stats.put("inactive", vehicleRepository.countByTenantIdAndStatus(tenantId, "INACTIVE"));
        stats.put("inMaintenance", vehicleRepository.countByTenantIdAndStatus(tenantId, "IN_MAINTENANCE"));
        stats.put("sold", vehicleRepository.countByTenantIdAndStatus(tenantId, "SOLD"));
        return stats;
    }

    // ─── Create ─────────────────────────────────────────────────

    @Transactional
    public VehicleResponse createVehicle(CreateVehicleRequest request) {
        UUID tenantId = TenantContext.get();

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

        resolveForeignKeys(vehicle, request, tenantId);

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
        resolveForeignKeys(vehicle, request, tenantId);

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

    private void resolveForeignKeys(Vehicle vehicle, CreateVehicleRequest request, UUID tenantId) {
        // Vehicle Type
        if (request.getVehicleTypeId() != null) {
            VehicleType vt = vehicleTypeRepository.findById(request.getVehicleTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("VehicleType", request.getVehicleTypeId()));
            vehicle.setVehicleType(vt);
        } else {
            vehicle.setVehicleType(null);
        }

        // Branch
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findByIdAndTenantId(request.getBranchId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", request.getBranchId()));
            vehicle.setBranch(branch);
        } else {
            vehicle.setBranch(null);
        }

        // Client (owner)
        if (request.getClientId() != null) {
            Client client = clientRepository.findByIdAndTenantId(request.getClientId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
            vehicle.setClient(client);
        } else {
            vehicle.setClient(null);
        }

        // Operator (Contact)
        if (request.getOperatorId() != null) {
            Contact operator = contactRepository.findByIdAndTenantId(request.getOperatorId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", request.getOperatorId()));
            vehicle.setOperator(operator);
        } else {
            vehicle.setOperator(null);
        }
    }
}
