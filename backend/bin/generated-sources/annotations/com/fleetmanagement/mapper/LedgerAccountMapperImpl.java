package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.LedgerAccountResponse;
import com.fleetmanagement.entity.Company;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.LedgerGroup;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:21:17+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class LedgerAccountMapperImpl implements LedgerAccountMapper {

    @Override
    public LedgerAccountResponse toResponse(LedgerAccount entity) {
        if ( entity == null ) {
            return null;
        }

        LedgerAccountResponse ledgerAccountResponse = new LedgerAccountResponse();

        ledgerAccountResponse.setCompanyId( entityCompanyId( entity ) );
        ledgerAccountResponse.setCompanyName( entity.getLegalName() );
        ledgerAccountResponse.setAccountGroupId( entityAccountGroupRefId( entity ) );
        ledgerAccountResponse.setAccountGroup( entityAccountGroupRefName( entity ) );
        ledgerAccountResponse.setId( entity.getId() );
        ledgerAccountResponse.setAccountHead( entity.getAccountHead() );
        ledgerAccountResponse.setTallyName( entity.getTallyName() );
        ledgerAccountResponse.setNameOnDashboard( entity.getNameOnDashboard() );
        ledgerAccountResponse.setPrintName( entity.getPrintName() );
        if ( entity.getAccountType() != null ) {
            ledgerAccountResponse.setAccountType( entity.getAccountType().name() );
        }
        ledgerAccountResponse.setOpeningBalance( entity.getOpeningBalance() );
        if ( entity.getDebitCredit() != null ) {
            ledgerAccountResponse.setDebitCredit( entity.getDebitCredit().name() );
        }
        ledgerAccountResponse.setCurrentBalance( entity.getCurrentBalance() );
        ledgerAccountResponse.setCurrency( entity.getCurrency() );
        ledgerAccountResponse.setActive( entity.isActive() );
        ledgerAccountResponse.setPanNumber( entity.getPanNumber() );
        ledgerAccountResponse.setGstin( entity.getGstin() );
        ledgerAccountResponse.setLegalName( entity.getLegalName() );
        ledgerAccountResponse.setOurVendorCode( entity.getOurVendorCode() );
        if ( entity.getTcsApplicable() != null ) {
            ledgerAccountResponse.setTcsApplicable( entity.getTcsApplicable().name() );
        }
        ledgerAccountResponse.setPaymentTerms( entity.getPaymentTerms() );
        ledgerAccountResponse.setTallyPaymentTerms( entity.getTallyPaymentTerms() );
        ledgerAccountResponse.setBillingAddress( entity.getBillingAddress() );
        ledgerAccountResponse.setCity( entity.getCity() );
        ledgerAccountResponse.setState( entity.getState() );
        ledgerAccountResponse.setStateCode( entity.getStateCode() );
        ledgerAccountResponse.setCountry( entity.getCountry() );
        ledgerAccountResponse.setPinCode( entity.getPinCode() );
        ledgerAccountResponse.setPhone( entity.getPhone() );
        ledgerAccountResponse.setMobile( entity.getMobile() );
        ledgerAccountResponse.setEmail( entity.getEmail() );
        ledgerAccountResponse.setContactPerson( entity.getContactPerson() );
        ledgerAccountResponse.setDesignation( entity.getDesignation() );
        ledgerAccountResponse.setWebsite( entity.getWebsite() );
        ledgerAccountResponse.setShippedToSameAsBilling( entity.isShippedToSameAsBilling() );
        ledgerAccountResponse.setShippingAddress( entity.getShippingAddress() );
        ledgerAccountResponse.setShippingCity( entity.getShippingCity() );
        ledgerAccountResponse.setShippingState( entity.getShippingState() );
        ledgerAccountResponse.setShippingStateCode( entity.getShippingStateCode() );
        ledgerAccountResponse.setShippingCountry( entity.getShippingCountry() );
        ledgerAccountResponse.setShippingPinCode( entity.getShippingPinCode() );
        ledgerAccountResponse.setShippingPhone( entity.getShippingPhone() );
        ledgerAccountResponse.setShippingMobile( entity.getShippingMobile() );
        ledgerAccountResponse.setShippingEmail( entity.getShippingEmail() );
        ledgerAccountResponse.setShippingContactPerson( entity.getShippingContactPerson() );
        ledgerAccountResponse.setShippingDesignation( entity.getShippingDesignation() );
        ledgerAccountResponse.setCinNumber( entity.getCinNumber() );
        ledgerAccountResponse.setDefaultShippedToCode( entity.getDefaultShippedToCode() );

        ledgerAccountResponse.setGroupNature( entity.getAccountGroupRef() != null ? entity.getAccountGroupRef().getNature().name() : null );

        return ledgerAccountResponse;
    }

    private UUID entityCompanyId(LedgerAccount ledgerAccount) {
        Company company = ledgerAccount.getCompany();
        if ( company == null ) {
            return null;
        }
        return company.getId();
    }

    private UUID entityAccountGroupRefId(LedgerAccount ledgerAccount) {
        LedgerGroup accountGroupRef = ledgerAccount.getAccountGroupRef();
        if ( accountGroupRef == null ) {
            return null;
        }
        return accountGroupRef.getId();
    }

    private String entityAccountGroupRefName(LedgerAccount ledgerAccount) {
        LedgerGroup accountGroupRef = ledgerAccount.getAccountGroupRef();
        if ( accountGroupRef == null ) {
            return null;
        }
        return accountGroupRef.getName();
    }
}
