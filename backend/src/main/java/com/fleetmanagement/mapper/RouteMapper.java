package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.request.CreateRouteRequest;
import com.fleetmanagement.dto.response.RouteResponse;
import com.fleetmanagement.entity.Route;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RouteMapper {

    @Mapping(target = "ledgerAccountId", source = "ledgerAccount.id")
    @Mapping(target = "ledgerAccountName", source = "ledgerAccount.accountHead")
    @Mapping(target = "invoiceTypeId", source = "invoiceType.id")
    @Mapping(target = "invoiceTypeName", source = "invoiceType.name")
    @Mapping(target = "annexureTypeId", source = "annexureType.id")
    @Mapping(target = "annexureTypeName", source = "annexureType.name")
    @Mapping(target = "vehicleTypeId", source = "vehicleTypeMaster.id")
    @Mapping(target = "vehicleTypeName", source = "vehicleTypeMaster.name")
    RouteResponse toResponse(Route route);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "ledgerAccount", ignore = true)
    @Mapping(target = "invoiceType", ignore = true)
    @Mapping(target = "annexureType", ignore = true)
    @Mapping(target = "vehicleTypeMaster", ignore = true)
    Route toEntity(CreateRouteRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "ledgerAccount", ignore = true)
    @Mapping(target = "invoiceType", ignore = true)
    @Mapping(target = "annexureType", ignore = true)
    @Mapping(target = "vehicleTypeMaster", ignore = true)
    void updateEntity(CreateRouteRequest request, @MappingTarget Route route);
}
