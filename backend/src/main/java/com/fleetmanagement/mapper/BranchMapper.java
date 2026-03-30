package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.entity.Branch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BranchMapper {

    @Mapping(target = "managerName", ignore = true)
    @Mapping(target = "vehicleCount", ignore = true)
    @Mapping(target = "driverCount", ignore = true)
    @Mapping(target = "tripCount", ignore = true)
    BranchResponse toResponse(Branch branch);
}
