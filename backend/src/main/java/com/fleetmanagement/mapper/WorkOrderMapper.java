package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.WorkOrderResponse;
import com.fleetmanagement.entity.WorkOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkOrderMapper {
    @Mapping(source = "vehicle.id", target = "vehicleId")
    @Mapping(source = "vehicle.registrationNumber", target = "vehicleName")
    @Mapping(source = "assignedTo.firstName", target = "assignedToName")
    WorkOrderResponse toResponse(WorkOrder workOrder);
}