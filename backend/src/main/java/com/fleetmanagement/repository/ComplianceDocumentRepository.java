package com.fleetmanagement.repository;

import com.fleetmanagement.entity.ComplianceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplianceDocumentRepository extends JpaRepository<ComplianceDocument, UUID> {

    List<ComplianceDocument> findByTenantId(UUID tenantId);

    Optional<ComplianceDocument> findByIdAndTenantId(UUID id, UUID tenantId);

    // All documents for a vehicle
    List<ComplianceDocument> findByVehicleIdAndTenantId(UUID vehicleId, UUID tenantId);

    // Current documents only
    List<ComplianceDocument> findByVehicleIdAndTenantIdAndIsCurrentTrue(UUID vehicleId, UUID tenantId);

    // Filter by type
    List<ComplianceDocument> findByVehicleIdAndTenantIdAndDocumentType(UUID vehicleId, UUID tenantId, String documentType);

    // Current document of a specific type
    Optional<ComplianceDocument> findByVehicleIdAndTenantIdAndDocumentTypeAndIsCurrentTrue(UUID vehicleId, UUID tenantId, String documentType);

    // Version history chain for a document
    @Query("SELECT cd FROM ComplianceDocument cd WHERE cd.tenantId = :tid AND cd.vehicle.id = :vid AND cd.documentType = :type ORDER BY cd.versionNumber DESC")
    List<ComplianceDocument> findVersionHistory(@Param("tid") UUID tenantId, @Param("vid") UUID vehicleId, @Param("type") String documentType);

    // Documents expiring within N days across fleet
    @Query("SELECT cd FROM ComplianceDocument cd WHERE cd.tenantId = :tid AND cd.isCurrent = true AND cd.effectiveTo IS NOT NULL AND cd.effectiveTo <= :cutoff AND cd.status != 'EXPIRED' AND cd.status != 'CANCELLED' AND cd.status != 'SUPERSEDED'")
    List<ComplianceDocument> findExpiringSoon(@Param("tid") UUID tenantId, @Param("cutoff") LocalDate cutoffDate);

    // Count by status for a vehicle
    long countByVehicleIdAndTenantIdAndIsCurrentTrueAndStatus(UUID vehicleId, UUID tenantId, String status);

    // Count expiring across fleet
    @Query("SELECT COUNT(cd) FROM ComplianceDocument cd WHERE cd.tenantId = :tid AND cd.isCurrent = true AND cd.effectiveTo IS NOT NULL AND cd.effectiveTo <= :cutoff AND cd.status NOT IN ('EXPIRED', 'CANCELLED', 'SUPERSEDED')")
    long countExpiringSoon(@Param("tid") UUID tenantId, @Param("cutoff") LocalDate cutoffDate);

    // Expired documents
    @Query("SELECT cd FROM ComplianceDocument cd WHERE cd.tenantId = :tid AND cd.isCurrent = true AND cd.effectiveTo IS NOT NULL AND cd.effectiveTo < :today AND cd.status != 'EXPIRED' AND cd.status != 'CANCELLED' AND cd.status != 'SUPERSEDED'")
    List<ComplianceDocument> findExpiredButNotMarked(@Param("tid") UUID tenantId, @Param("today") LocalDate today);
}
