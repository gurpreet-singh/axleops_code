package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.ContactResponse;
import com.fleetmanagement.mapper.ContactMapper;
import com.fleetmanagement.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContactService {

    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    public List<ContactResponse> getAllContacts() {
        UUID tenantId = TenantContext.get();
        return contactRepository.findByTenantId(tenantId).stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    public List<ContactResponse> getDrivers() {
        UUID tenantId = TenantContext.get();
        return contactRepository.findByTenantIdAndType(tenantId, "DRIVER").stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    public ContactResponse getContactById(UUID id) {
        UUID tenantId = TenantContext.get();
        return contactRepository.findByIdAndTenantId(id, tenantId)
                .map(contactMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id));
    }
}
