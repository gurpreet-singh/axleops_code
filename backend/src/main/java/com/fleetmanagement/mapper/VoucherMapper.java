package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.VoucherResponse;
import com.fleetmanagement.entity.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    @Mapping(source = "debitLedger.id", target = "debitLedgerId")
    @Mapping(source = "debitLedger.accountHead", target = "debitLedgerName")
    @Mapping(source = "creditLedger.id", target = "creditLedgerId")
    @Mapping(source = "creditLedger.accountHead", target = "creditLedgerName")
    @Mapping(source = "trip.id", target = "tripId")
    @Mapping(source = "trip.tripNumber", target = "tripNumber")
    VoucherResponse toResponse(Voucher voucher);
}