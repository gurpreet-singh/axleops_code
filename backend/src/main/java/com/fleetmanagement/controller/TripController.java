package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.response.TripResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    @RequiresAuthority(Authority.TRIP_READ)
    public ResponseEntity<List<TripResponse>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/{id}")
    @RequiresAuthority(Authority.TRIP_READ)
    public ResponseEntity<TripResponse> getTripById(@PathVariable UUID id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @DeleteMapping("/{id}")
    @RequiresAuthority(Authority.TRIP_DELETE)
    public ResponseEntity<Void> deleteTrip(@PathVariable UUID id) {
        tripService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
