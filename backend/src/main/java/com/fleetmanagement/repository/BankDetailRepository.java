package com.fleetmanagement.repository;

import com.fleetmanagement.entity.BankDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BankDetailRepository extends JpaRepository<BankDetail, UUID> {

    Optional<BankDetail> findByLedgerAccountId(UUID ledgerAccountId);
}
