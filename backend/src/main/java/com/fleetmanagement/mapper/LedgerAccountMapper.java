package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.LedgerAccountResponse;
import com.fleetmanagement.entity.LedgerAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LedgerAccountMapper {

    @Mapping(source = "company.id", target = "companyId")
    @Mapping(source = "legalName", target = "companyName")
    @Mapping(source = "accountGroupRef.id", target = "accountGroupId")
    LedgerAccountResponse toResponse(LedgerAccount entity);
}
