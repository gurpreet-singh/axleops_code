package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.ContactResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Contact;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:21:15+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class ContactMapperImpl implements ContactMapper {

    @Override
    public ContactResponse toResponse(Contact contact) {
        if ( contact == null ) {
            return null;
        }

        ContactResponse contactResponse = new ContactResponse();

        contactResponse.setBranchName( contactBranchName( contact ) );
        contactResponse.setId( contact.getId() );
        contactResponse.setFirstName( contact.getFirstName() );
        contactResponse.setLastName( contact.getLastName() );
        contactResponse.setPhone( contact.getPhone() );
        contactResponse.setEmail( contact.getEmail() );
        contactResponse.setType( contact.getType() );
        contactResponse.setLicenseNumber( contact.getLicenseNumber() );
        contactResponse.setLicenseExpiry( contact.getLicenseExpiry() );
        contactResponse.setCity( contact.getCity() );
        contactResponse.setStatus( contact.getStatus() );

        return contactResponse;
    }

    private String contactBranchName(Contact contact) {
        Branch branch = contact.getBranch();
        if ( branch == null ) {
            return null;
        }
        return branch.getName();
    }
}
