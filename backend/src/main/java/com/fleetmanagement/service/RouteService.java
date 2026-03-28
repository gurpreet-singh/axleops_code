package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.RouteResponse;
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
        return routeRepository.findAll().stream()
                .map(routeMapper::toResponse)
                .toList();
    }

    public RouteResponse getRouteById(UUID id) {
        return routeRepository.findById(id)
                .map(routeMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Route not found: " + id));
    }

    @Transactional
    public void delete(UUID id) {
        routeRepository.deleteById(id);
    }
}
