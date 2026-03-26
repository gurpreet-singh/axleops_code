package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.InvoiceResponse;
import com.fleetmanagement.entity.Invoice;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InvoiceMapper {
    @Mapping(source = "client.id", target = "clientId")
    @Mapping(source = "client.name", target = "clientName")
    InvoiceResponse toResponse(Invoice invoice);
}