package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.LedgerResponse;
import com.fleetmanagement.entity.Ledger;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LedgerMapper {
    LedgerResponse toResponse(Ledger ledger);
}