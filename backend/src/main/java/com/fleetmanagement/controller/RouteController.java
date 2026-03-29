package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.request.CreateRouteRequest;
import com.fleetmanagement.dto.response.RouteResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    @GetMapping
    @RequiresAuthority(Authority.TRIP_READ)
    public ResponseEntity<List<RouteResponse>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @GetMapping("/{id}")
    @RequiresAuthority(Authority.TRIP_READ)
    public ResponseEntity<RouteResponse> getRouteById(@PathVariable UUID id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    @PostMapping
    @RequiresAuthority(Authority.TRIP_CREATE)
    public ResponseEntity<RouteResponse> createRoute(@RequestBody CreateRouteRequest request) {
        return ResponseEntity.ok(routeService.create(request));
    }

    @PutMapping("/{id}")
    @RequiresAuthority(Authority.TRIP_UPDATE)
    public ResponseEntity<RouteResponse> updateRoute(@PathVariable UUID id, @RequestBody CreateRouteRequest request) {
        return ResponseEntity.ok(routeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @RequiresAuthority(Authority.TRIP_DELETE)
    public ResponseEntity<Void> deleteRoute(@PathVariable UUID id) {
        routeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
