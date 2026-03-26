package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.mapper.VehicleMapper;
import com.fleetmanagement.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toResponse)
                .toList();
    }

    public VehicleResponse getVehicleById(UUID id) {
        return vehicleRepository.findById(id)
                .map(vehicleMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + id));
    }
}
