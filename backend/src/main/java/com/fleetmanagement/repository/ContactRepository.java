package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findByTenantId(UUID tenantId);
    List<Contact> findByTenantIdAndType(UUID tenantId, String type);
    List<Contact> findByType(String type);
    Optional<Contact> findByIdAndTenantId(UUID id, UUID tenantId);
}
