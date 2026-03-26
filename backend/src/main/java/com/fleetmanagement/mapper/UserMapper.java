package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.UserResponse;
import com.fleetmanagement.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "branch.id", target = "branchId")
    @Mapping(source = "branch.name", target = "branchName")
    UserResponse toResponse(User user);
}