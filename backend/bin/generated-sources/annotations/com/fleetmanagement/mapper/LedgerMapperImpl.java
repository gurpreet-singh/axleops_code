package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.LedgerResponse;
import com.fleetmanagement.entity.Ledger;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:17:35+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class LedgerMapperImpl implements LedgerMapper {

    @Override
    public LedgerResponse toResponse(Ledger ledger) {
        if ( ledger == null ) {
            return null;
        }

        LedgerResponse ledgerResponse = new LedgerResponse();

        ledgerResponse.setId( ledger.getId() );
        ledgerResponse.setCode( ledger.getCode() );
        ledgerResponse.setName( ledger.getName() );
        ledgerResponse.setTallyGroup( ledger.getTallyGroup() );
        ledgerResponse.setNormalBalance( ledger.getNormalBalance() );

        return ledgerResponse;
    }
}
