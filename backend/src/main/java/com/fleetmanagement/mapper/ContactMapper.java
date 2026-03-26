package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.ContactResponse;
import com.fleetmanagement.entity.Contact;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContactMapper {

    @Mapping(source = "branch.name", target = "branchName")
    ContactResponse toResponse(Contact contact);
}
