package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.request.CreateRouteRequest;
import com.fleetmanagement.dto.response.RouteResponse;
import com.fleetmanagement.entity.AnnexureType;
import com.fleetmanagement.entity.InvoiceType;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.Route;
import com.fleetmanagement.mapper.RouteMapper;
import com.fleetmanagement.repository.AnnexureTypeRepository;
import com.fleetmanagement.repository.InvoiceTypeRepository;
import com.fleetmanagement.repository.LedgerAccountRepository;
import com.fleetmanagement.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteService {

    private final RouteRepository routeRepository;
    private final RouteMapper routeMapper;
    private final LedgerAccountRepository ledgerAccountRepository;
    private final InvoiceTypeRepository invoiceTypeRepository;
    private final AnnexureTypeRepository annexureTypeRepository;

    public List<RouteResponse> getAllRoutes() {
        UUID tenantId = TenantContext.get();
        return routeRepository.findByTenantId(tenantId).stream()
                .map(routeMapper::toResponse)
                .toList();
    }

    public RouteResponse getRouteById(UUID id) {
        UUID tenantId = TenantContext.get();
        return routeRepository.findByIdAndTenantId(id, tenantId)
                .map(routeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id));
    }

    @Transactional
    public RouteResponse create(CreateRouteRequest request) {
        UUID tenantId = TenantContext.get();

        // Validate uniqueness of route name within tenant
        routeRepository.findByNameIgnoreCaseAndTenantId(request.getName(), tenantId)
                .ifPresent(r -> {
                    throw new IllegalArgumentException(
                            "Route with name '" + request.getName() + "' already exists");
                });

        Route route = routeMapper.toEntity(request);
        route.setTenantId(tenantId);

        if (route.getStatus() == null || route.getStatus().isBlank()) {
            route.setStatus("ACTIVE");
        }

        resolveForeignKeys(route, request, tenantId);

        return routeMapper.toResponse(routeRepository.save(route));
    }

    @Transactional
    public RouteResponse update(UUID id, CreateRouteRequest request) {
        UUID tenantId = TenantContext.get();
        Route route = routeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id));

        // If name is changing, validate uniqueness
        if (request.getName() != null && !request.getName().equalsIgnoreCase(route.getName())) {
            routeRepository.findByNameIgnoreCaseAndTenantId(request.getName(), tenantId)
                    .ifPresent(r -> {
                        throw new IllegalArgumentException(
                                "Route with name '" + request.getName() + "' already exists");
                    });
        }

        routeMapper.updateEntity(request, route);

        resolveForeignKeys(route, request, tenantId);

        return routeMapper.toResponse(routeRepository.save(route));
    }

    @Transactional
    public void delete(UUID id) {
        UUID tenantId = TenantContext.get();
        Route route = routeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id));
        routeRepository.delete(route);
    }

    // ─── Private helpers ─────────────────────────────────────────

    private void resolveForeignKeys(Route route, CreateRouteRequest request, UUID tenantId) {
        // Ledger Account
        if (request.getLedgerAccountId() != null) {
            LedgerAccount la = ledgerAccountRepository
                    .findByIdAndTenantId(request.getLedgerAccountId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("LedgerAccount", request.getLedgerAccountId()));
            route.setLedgerAccount(la);
        } else {
            route.setLedgerAccount(null);
        }

        // Invoice Type
        if (request.getInvoiceTypeId() != null) {
            InvoiceType it = invoiceTypeRepository
                    .findByIdAndTenantId(request.getInvoiceTypeId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("InvoiceType", request.getInvoiceTypeId()));
            route.setInvoiceType(it);
        } else {
            route.setInvoiceType(null);
        }

        // Annexure Type
        if (request.getAnnexureTypeId() != null) {
            AnnexureType at = annexureTypeRepository
                    .findByIdAndTenantId(request.getAnnexureTypeId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("AnnexureType", request.getAnnexureTypeId()));
            route.setAnnexureType(at);
        } else {
            route.setAnnexureType(null);
        }
    }
}
