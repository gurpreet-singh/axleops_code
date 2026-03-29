package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.WorkOrderResponse;
import com.fleetmanagement.entity.Contact;
import com.fleetmanagement.entity.Vehicle;
import com.fleetmanagement.entity.WorkOrder;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-29T10:20:30+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class WorkOrderMapperImpl implements WorkOrderMapper {

    @Override
    public WorkOrderResponse toResponse(WorkOrder workOrder) {
        if ( workOrder == null ) {
            return null;
        }

        WorkOrderResponse workOrderResponse = new WorkOrderResponse();

        workOrderResponse.setVehicleId( workOrderVehicleId( workOrder ) );
        workOrderResponse.setVehicleName( workOrderVehicleRegistrationNumber( workOrder ) );
        workOrderResponse.setAssignedToName( workOrderAssignedToFirstName( workOrder ) );
        workOrderResponse.setId( workOrder.getId() );
        workOrderResponse.setWorkOrderNumber( workOrder.getWorkOrderNumber() );
        workOrderResponse.setStatus( workOrder.getStatus() );
        workOrderResponse.setPriority( workOrder.getPriority() );
        workOrderResponse.setTotalCost( workOrder.getTotalCost() );
        workOrderResponse.setIssueDate( workOrder.getIssueDate() );
        workOrderResponse.setServiceTasks( workOrder.getServiceTasks() );
        workOrderResponse.setLabel( workOrder.getLabel() );

        return workOrderResponse;
    }

    private UUID workOrderVehicleId(WorkOrder workOrder) {
        Vehicle vehicle = workOrder.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        return vehicle.getId();
    }

    private String workOrderVehicleRegistrationNumber(WorkOrder workOrder) {
        Vehicle vehicle = workOrder.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        return vehicle.getRegistrationNumber();
    }

    private String workOrderAssignedToFirstName(WorkOrder workOrder) {
        Contact assignedTo = workOrder.getAssignedTo();
        if ( assignedTo == null ) {
            return null;
        }
        return assignedTo.getFirstName();
    }
}
