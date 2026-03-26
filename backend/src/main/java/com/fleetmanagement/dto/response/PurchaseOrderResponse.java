package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PurchaseOrderResponse {
    private UUID id;
    private String poNumber;
    private String vendorName;
    private LocalDate orderDate;
    private LocalDate deliveryDate;
    private Integer itemCount;
    private BigDecimal totalAmount;
    private String status;
}
