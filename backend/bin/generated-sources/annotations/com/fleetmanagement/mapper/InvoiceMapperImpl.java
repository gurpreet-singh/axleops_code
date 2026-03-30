package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.InvoiceResponse;
import com.fleetmanagement.entity.Client;
import com.fleetmanagement.entity.Invoice;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:17:18+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class InvoiceMapperImpl implements InvoiceMapper {

    @Override
    public InvoiceResponse toResponse(Invoice invoice) {
        if ( invoice == null ) {
            return null;
        }

        InvoiceResponse invoiceResponse = new InvoiceResponse();

        invoiceResponse.setClientId( invoiceClientId( invoice ) );
        invoiceResponse.setClientName( invoiceClientName( invoice ) );
        invoiceResponse.setId( invoice.getId() );
        invoiceResponse.setInvoiceNumber( invoice.getInvoiceNumber() );
        invoiceResponse.setDate( invoice.getDate() );
        invoiceResponse.setDueDate( invoice.getDueDate() );
        invoiceResponse.setAmount( invoice.getAmount() );
        invoiceResponse.setGstAmount( invoice.getGstAmount() );
        invoiceResponse.setTotalAmount( invoice.getTotalAmount() );
        invoiceResponse.setStatus( invoice.getStatus() );

        return invoiceResponse;
    }

    private UUID invoiceClientId(Invoice invoice) {
        Client client = invoice.getClient();
        if ( client == null ) {
            return null;
        }
        return client.getId();
    }

    private String invoiceClientName(Invoice invoice) {
        Client client = invoice.getClient();
        if ( client == null ) {
            return null;
        }
        return client.getName();
    }
}
