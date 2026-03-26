package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.PartResponse;
import com.fleetmanagement.mapper.PartMapper;
import com.fleetmanagement.repository.PartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PartService {

    private final PartRepository partRepository;
    private final PartMapper partMapper;

    public List<PartResponse> getAllParts() {
        return partRepository.findAll().stream()
                .map(partMapper::toResponse)
                .toList();
    }

    public PartResponse getPartById(UUID id) {
        return partRepository.findById(id)
                .map(partMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Part not found: " + id));
    }
}
