package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.entity.Branch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BranchMapper {
    @Mapping(source = "tenantId", target = "tenantId")
    BranchResponse toResponse(Branch branch);
}
