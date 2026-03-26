package com.fleetmanagement.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PartResponse {
    private UUID id;
    private String name;
    private String partNumber;
    private String category;
    private String location;
    private Integer inStock;
    private Integer minQty;
    private BigDecimal unitCost;
}
