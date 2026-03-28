package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
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
        UUID tenantId = TenantContext.get();
        return partRepository.findByTenantId(tenantId).stream()
                .map(partMapper::toResponse)
                .toList();
    }

    public PartResponse getPartById(UUID id) {
        UUID tenantId = TenantContext.get();
        return partRepository.findByIdAndTenantId(id, tenantId)
                .map(partMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Part", id));
    }
}
