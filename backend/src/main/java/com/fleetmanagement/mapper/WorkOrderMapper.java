package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.WorkOrderResponse;
import com.fleetmanagement.entity.WorkOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkOrderMapper {
    @Mapping(source = "vehicle.id", target = "vehicleId")
    @Mapping(source = "vehicle.name", target = "vehicleName")
    @Mapping(source = "assignedTo.name", target = "assignedToName")
    WorkOrderResponse toResponse(WorkOrder workOrder);
}