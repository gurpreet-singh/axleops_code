package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.request.CreateVehicleRequest;
import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    @Mapping(source = "vehicleTypeMaster.id", target = "vehicleTypeId")
    @Mapping(source = "vehicleTypeMaster.name", target = "vehicleTypeName")
    @Mapping(source = "branch.id", target = "branchId")
    @Mapping(source = "branch.name", target = "branchName")
    @Mapping(source = "client.id", target = "clientId")
    @Mapping(source = "client.name", target = "clientName")
    @Mapping(source = "operator.id", target = "operatorId")
    @Mapping(source = "operator.firstName", target = "operatorName")
    VehicleResponse toResponse(Vehicle vehicle);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "vehicleTypeMaster", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "operator", ignore = true)
    Vehicle toEntity(CreateVehicleRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "vehicleTypeMaster", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "client", ignore = true)
    @Mapping(target = "operator", ignore = true)
    void updateEntity(CreateVehicleRequest request, @MappingTarget Vehicle vehicle);
}
