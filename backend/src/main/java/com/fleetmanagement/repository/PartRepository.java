package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartRepository extends JpaRepository<Part, UUID> {
    List<Part> findByTenantId(UUID tenantId);
    Optional<Part> findByIdAndTenantId(UUID id, UUID tenantId);
}
