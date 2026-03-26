package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.RouteResponse;
import com.fleetmanagement.entity.Route;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RouteMapper {
    RouteResponse toResponse(Route route);
}
