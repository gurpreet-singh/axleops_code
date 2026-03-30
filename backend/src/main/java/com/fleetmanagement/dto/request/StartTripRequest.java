package com.fleetmanagement.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class StartTripRequest {
    private UUID vehicleId;
    private UUID driverId;
}
