package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.TripResponse;
import com.fleetmanagement.entity.Trip;
import com.fleetmanagement.mapper.TripMapper;
import com.fleetmanagement.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TripService {

    private final TripRepository tripRepository;
    private final TripMapper tripMapper;

    public List<TripResponse> getAllTrips() {
        UUID tenantId = TenantContext.get();
        return tripRepository.findByTenantId(tenantId).stream()
                .map(tripMapper::toResponse)
                .toList();
    }

    public TripResponse getTripById(UUID id) {
        UUID tenantId = TenantContext.get();
        return tripRepository.findByIdAndTenantId(id, tenantId)
                .map(tripMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
    }

    @Transactional
    public void delete(UUID id) {
        UUID tenantId = TenantContext.get();
        Trip trip = tripRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
        tripRepository.delete(trip);
    }
}
