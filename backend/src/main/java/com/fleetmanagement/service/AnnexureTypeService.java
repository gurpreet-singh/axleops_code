package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.entity.AnnexureType;
import com.fleetmanagement.repository.AnnexureTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnnexureTypeService {

    private final AnnexureTypeRepository repository;

    public List<AnnexureType> getAll() {
        return repository.findByTenantId(TenantContext.get());
    }

    public AnnexureType getById(UUID id) {
        return repository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> new ResourceNotFoundException("AnnexureType", id));
    }

    @Transactional
    public AnnexureType create(String name) {
        AnnexureType at = new AnnexureType();
        at.setName(name);
        at.setTenantId(TenantContext.get());
        return repository.save(at);
    }

    @Transactional
    public AnnexureType update(UUID id, String name) {
        AnnexureType at = getById(id);
        at.setName(name);
        return repository.save(at);
    }

    @Transactional
    public void delete(UUID id) {
        AnnexureType at = getById(id);
        repository.delete(at);
    }
}
