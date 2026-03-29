package com.fleetmanagement.repository;

import com.fleetmanagement.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, UUID> {

    List<VehicleType> findByTenantId(UUID tenantId);
}
