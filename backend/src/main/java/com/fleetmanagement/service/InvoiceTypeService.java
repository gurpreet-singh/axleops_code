package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.entity.InvoiceType;
import com.fleetmanagement.repository.InvoiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceTypeService {

    private final InvoiceTypeRepository repository;

    public List<InvoiceType> getAll() {
        return repository.findByTenantId(TenantContext.get());
    }

    public InvoiceType getById(UUID id) {
        return repository.findByIdAndTenantId(id, TenantContext.get())
                .orElseThrow(() -> new ResourceNotFoundException("InvoiceType", id));
    }

    @Transactional
    public InvoiceType create(String name) {
        InvoiceType it = new InvoiceType();
        it.setName(name);
        it.setTenantId(TenantContext.get());
        return repository.save(it);
    }

    @Transactional
    public InvoiceType update(UUID id, String name) {
        InvoiceType it = getById(id);
        it.setName(name);
        return repository.save(it);
    }

    @Transactional
    public void delete(UUID id) {
        InvoiceType it = getById(id);
        repository.delete(it);
    }
}
