package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {
    List<Loan> findByTenantId(UUID tenantId);
    Optional<Loan> findByIdAndTenantId(UUID id, UUID tenantId);
    List<Loan> findByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);
    Optional<Loan> findByVehicleIdAndTenantIdAndStatus(UUID vehicleId, UUID tenantId, String status);
}
