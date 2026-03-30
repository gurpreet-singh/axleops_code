package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.PartResponse;
import com.fleetmanagement.entity.Part;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:17:30+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class PartMapperImpl implements PartMapper {

    @Override
    public PartResponse toResponse(Part part) {
        if ( part == null ) {
            return null;
        }

        PartResponse partResponse = new PartResponse();

        partResponse.setId( part.getId() );
        partResponse.setName( part.getName() );
        partResponse.setPartNumber( part.getPartNumber() );
        partResponse.setCategory( part.getCategory() );
        partResponse.setLocation( part.getLocation() );
        partResponse.setInStock( part.getInStock() );
        partResponse.setMinQty( part.getMinQty() );
        partResponse.setUnitCost( part.getUnitCost() );

        return partResponse;
    }
}
