package com.fleetmanagement.dto.response;

import lombok.Data;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class WorkOrderResponse {
    private UUID id;
    private String workOrderNumber;
    private UUID vehicleId;
    private String vehicleName;
    private String status;
    private String priority;
    private BigDecimal totalCost;
    private LocalDate issueDate;
    private String assignedToName;
    private String serviceTasks;
    private String label;
}