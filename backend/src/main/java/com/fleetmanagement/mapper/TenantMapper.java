package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.TenantResponse;
import com.fleetmanagement.entity.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TenantMapper {
    @Mapping(target = "branchCount", ignore = true)
    @Mapping(target = "userCount", ignore = true)
    TenantResponse toResponse(Tenant tenant);
}
