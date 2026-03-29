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
    @Mapping(source = "accountGroupRef.name", target = "accountGroup")
    @Mapping(expression = "java(entity.getAccountGroupRef() != null ? entity.getAccountGroupRef().getNature().name() : null)", target = "groupNature")
    LedgerAccountResponse toResponse(LedgerAccount entity);
}
