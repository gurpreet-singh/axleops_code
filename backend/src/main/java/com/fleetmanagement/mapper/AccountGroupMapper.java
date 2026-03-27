package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.AccountGroupResponse;
import com.fleetmanagement.entity.AccountGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AccountGroupMapper {

    @Mapping(source = "parentGroup.id", target = "parentGroupId")
    AccountGroupResponse toResponse(AccountGroup entity);
}
