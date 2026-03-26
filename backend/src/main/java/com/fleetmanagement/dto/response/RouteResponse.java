package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class RouteResponse {
    private UUID id;
    private String name;
    private String origin;
    private String destination;
    private BigDecimal distanceKm;
    private BigDecimal estimatedHours;
    private BigDecimal tollCost;
    private String via;
    private String originPin;
    private String destPin;
    private Integer slaHours;
    private String paymentTerms;
    private String template;
    private String status;
}
