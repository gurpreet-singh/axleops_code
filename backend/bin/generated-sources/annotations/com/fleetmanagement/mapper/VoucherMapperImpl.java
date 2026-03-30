package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.VoucherResponse;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.Trip;
import com.fleetmanagement.entity.Voucher;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:17:23+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class VoucherMapperImpl implements VoucherMapper {

    @Override
    public VoucherResponse toResponse(Voucher voucher) {
        if ( voucher == null ) {
            return null;
        }

        VoucherResponse voucherResponse = new VoucherResponse();

        voucherResponse.setDebitLedgerId( voucherDebitLedgerId( voucher ) );
        voucherResponse.setDebitLedgerName( voucherDebitLedgerAccountHead( voucher ) );
        voucherResponse.setCreditLedgerId( voucherCreditLedgerId( voucher ) );
        voucherResponse.setCreditLedgerName( voucherCreditLedgerAccountHead( voucher ) );
        voucherResponse.setTripId( voucherTripId( voucher ) );
        voucherResponse.setTripNumber( voucherTripTripNumber( voucher ) );
        voucherResponse.setId( voucher.getId() );
        voucherResponse.setVoucherNumber( voucher.getVoucherNumber() );
        voucherResponse.setType( voucher.getType() );
        voucherResponse.setDate( voucher.getDate() );
        voucherResponse.setAmount( voucher.getAmount() );
        voucherResponse.setNarration( voucher.getNarration() );

        return voucherResponse;
    }

    private UUID voucherDebitLedgerId(Voucher voucher) {
        LedgerAccount debitLedger = voucher.getDebitLedger();
        if ( debitLedger == null ) {
            return null;
        }
        return debitLedger.getId();
    }

    private String voucherDebitLedgerAccountHead(Voucher voucher) {
        LedgerAccount debitLedger = voucher.getDebitLedger();
        if ( debitLedger == null ) {
            return null;
        }
        return debitLedger.getAccountHead();
    }

    private UUID voucherCreditLedgerId(Voucher voucher) {
        LedgerAccount creditLedger = voucher.getCreditLedger();
        if ( creditLedger == null ) {
            return null;
        }
        return creditLedger.getId();
    }

    private String voucherCreditLedgerAccountHead(Voucher voucher) {
        LedgerAccount creditLedger = voucher.getCreditLedger();
        if ( creditLedger == null ) {
            return null;
        }
        return creditLedger.getAccountHead();
    }

    private UUID voucherTripId(Voucher voucher) {
        Trip trip = voucher.getTrip();
        if ( trip == null ) {
            return null;
        }
        return trip.getId();
    }

    private String voucherTripTripNumber(Voucher voucher) {
        Trip trip = voucher.getTrip();
        if ( trip == null ) {
            return null;
        }
        return trip.getTripNumber();
    }
}
