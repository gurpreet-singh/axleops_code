package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.CompanyResponse;
import com.fleetmanagement.entity.Company;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:29:31+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class CompanyMapperImpl implements CompanyMapper {

    @Override
    public CompanyResponse toResponse(Company entity) {
        if ( entity == null ) {
            return null;
        }

        CompanyResponse companyResponse = new CompanyResponse();

        companyResponse.setId( entity.getId() );
        companyResponse.setPanNumber( entity.getPanNumber() );
        companyResponse.setLegalName( entity.getLegalName() );
        companyResponse.setTradeName( entity.getTradeName() );
        companyResponse.setCinNumber( entity.getCinNumber() );
        if ( entity.getCompanyType() != null ) {
            companyResponse.setCompanyType( entity.getCompanyType().name() );
        }
        companyResponse.setDefaultPaymentTerms( entity.getDefaultPaymentTerms() );
        companyResponse.setOurVendorCode( entity.getOurVendorCode() );
        companyResponse.setLastYearRevenue( entity.getLastYearRevenue() );
        companyResponse.setWebsite( entity.getWebsite() );
        companyResponse.setGstRegistered( entity.isGstRegistered() );
        companyResponse.setFuelVendor( entity.isFuelVendor() );
        List<String> list = entity.getGstins();
        if ( list != null ) {
            companyResponse.setGstins( new ArrayList<String>( list ) );
        }

        return companyResponse;
    }
}
