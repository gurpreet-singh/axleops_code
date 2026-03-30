package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RouteRepository extends JpaRepository<Route, UUID> {
    List<Route> findByTenantId(UUID tenantId);
    Optional<Route> findByIdAndTenantId(UUID id, UUID tenantId);
    Optional<Route> findByNameIgnoreCaseAndTenantId(String name, UUID tenantId);
}
