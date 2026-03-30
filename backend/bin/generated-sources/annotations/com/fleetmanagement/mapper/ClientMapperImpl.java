package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.ClientResponse;
import com.fleetmanagement.entity.Client;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:21:09+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ClientMapperImpl implements ClientMapper {

    @Override
    public ClientResponse toResponse(Client client) {
        if ( client == null ) {
            return null;
        }

        ClientResponse clientResponse = new ClientResponse();

        clientResponse.setId( client.getId() );
        clientResponse.setName( client.getName() );
        clientResponse.setTradeName( client.getTradeName() );
        clientResponse.setGstin( client.getGstin() );
        clientResponse.setPan( client.getPan() );
        clientResponse.setAddress( client.getAddress() );
        clientResponse.setCity( client.getCity() );
        clientResponse.setState( client.getState() );
        clientResponse.setPhone( client.getPhone() );
        clientResponse.setEmail( client.getEmail() );
        clientResponse.setBillingType( client.getBillingType() );
        clientResponse.setIndustry( client.getIndustry() );
        clientResponse.setContractType( client.getContractType() );
        clientResponse.setRate( client.getRate() );
        clientResponse.setCreditLimit( client.getCreditLimit() );
        clientResponse.setStatus( client.getStatus() );

        return clientResponse;
    }
}
