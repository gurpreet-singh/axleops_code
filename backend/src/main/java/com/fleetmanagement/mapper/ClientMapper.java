package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.ClientResponse;
import com.fleetmanagement.entity.Client;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ClientMapper {
    ClientResponse toResponse(Client client);
}