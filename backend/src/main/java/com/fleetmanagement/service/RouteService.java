package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.RouteResponse;
import com.fleetmanagement.entity.Route;
import com.fleetmanagement.mapper.RouteMapper;
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
    public void delete(UUID id) {
        UUID tenantId = TenantContext.get();
        Route route = routeRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", id));
        routeRepository.delete(route);
    }
}
