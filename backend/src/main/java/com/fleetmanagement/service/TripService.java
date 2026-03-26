package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.TripResponse;
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
        return tripRepository.findAll().stream()
                .map(tripMapper::toResponse)
                .toList();
    }

    public TripResponse getTripById(UUID id) {
        return tripRepository.findById(id)
                .map(tripMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Trip not found: " + id));
    }
}
