package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VehicleMapper {

    @Mapping(source = "vehicleType.name", target = "vehicleTypeName")
    VehicleResponse toResponse(Vehicle vehicle);
}
