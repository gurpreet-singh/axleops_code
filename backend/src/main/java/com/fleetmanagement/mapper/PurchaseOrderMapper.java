package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.PurchaseOrderResponse;
import com.fleetmanagement.entity.PurchaseOrder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PurchaseOrderMapper {
    PurchaseOrderResponse toResponse(PurchaseOrder purchaseOrder);
}
