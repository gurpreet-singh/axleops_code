package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.PartResponse;
import com.fleetmanagement.entity.Part;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PartMapper {
    PartResponse toResponse(Part part);
}
