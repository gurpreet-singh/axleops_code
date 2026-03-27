package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.CompanyResponse;
import com.fleetmanagement.entity.Company;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CompanyMapper {
    CompanyResponse toResponse(Company entity);
}
