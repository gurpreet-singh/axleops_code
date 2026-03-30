package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.PurchaseOrderResponse;
import com.fleetmanagement.entity.PurchaseOrder;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:17:33+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PurchaseOrderMapperImpl implements PurchaseOrderMapper {

    @Override
    public PurchaseOrderResponse toResponse(PurchaseOrder purchaseOrder) {
        if ( purchaseOrder == null ) {
            return null;
        }

        PurchaseOrderResponse purchaseOrderResponse = new PurchaseOrderResponse();

        purchaseOrderResponse.setId( purchaseOrder.getId() );
        purchaseOrderResponse.setPoNumber( purchaseOrder.getPoNumber() );
        purchaseOrderResponse.setVendorName( purchaseOrder.getVendorName() );
        purchaseOrderResponse.setOrderDate( purchaseOrder.getOrderDate() );
        purchaseOrderResponse.setDeliveryDate( purchaseOrder.getDeliveryDate() );
        purchaseOrderResponse.setItemCount( purchaseOrder.getItemCount() );
        purchaseOrderResponse.setTotalAmount( purchaseOrder.getTotalAmount() );
        purchaseOrderResponse.setStatus( purchaseOrder.getStatus() );

        return purchaseOrderResponse;
    }
}
