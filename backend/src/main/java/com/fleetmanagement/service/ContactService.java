package com.fleetmanagement.service;

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
        return contactRepository.findAll().stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    public List<ContactResponse> getDrivers() {
        return contactRepository.findByType("DRIVER").stream()
                .map(contactMapper::toResponse)
                .toList();
    }

    public ContactResponse getContactById(UUID id) {
        return contactRepository.findById(id)
                .map(contactMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Contact not found: " + id));
    }
}
