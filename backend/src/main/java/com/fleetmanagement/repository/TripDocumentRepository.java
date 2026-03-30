package com.fleetmanagement.repository;

import com.fleetmanagement.entity.DocumentType;
import com.fleetmanagement.entity.TripDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripDocumentRepository extends JpaRepository<TripDocument, UUID> {
    List<TripDocument> findByTripIdAndTenantId(UUID tripId, UUID tenantId);
    Optional<TripDocument> findByTripIdAndTenantIdAndDocumentType(UUID tripId, UUID tenantId, DocumentType type);
    Optional<TripDocument> findByIdAndTenantId(UUID id, UUID tenantId);
}
