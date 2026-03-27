package com.fleetmanagement.repository;

import com.fleetmanagement.entity.DispatchDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DispatchDetailRepository extends JpaRepository<DispatchDetail, UUID> {

    List<DispatchDetail> findByCompanyId(UUID companyId);
}
