package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.LedgerGroupResponse;
import com.fleetmanagement.entity.LedgerGroup;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LedgerGroupMapper {

    @Mapping(source = "parentGroup.id", target = "parentGroupId")
    LedgerGroupResponse toResponse(LedgerGroup entity);
}
