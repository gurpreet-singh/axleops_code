package com.fleetmanagement.repository;

import com.fleetmanagement.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, UUID> {

    @Query("SELECT v FROM Voucher v WHERE v.tenantId = :tenantId AND " +
           "(:branchIds IS NULL OR v.branch.id IN :branchIds) " +
           "ORDER BY v.date DESC")
    List<Voucher> findAllScoped(@Param("tenantId") UUID tenantId, @Param("branchIds") List<UUID> branchIds);
}