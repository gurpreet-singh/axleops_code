package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT i FROM Invoice i WHERE i.tenantId = :tenantId AND " +
           "(:branchIds IS NULL OR i.branch.id IN :branchIds) " +
           "ORDER BY i.createdAt DESC")
    List<Invoice> findAllScoped(@Param("tenantId") UUID tenantId, @Param("branchIds") List<UUID> branchIds);
}