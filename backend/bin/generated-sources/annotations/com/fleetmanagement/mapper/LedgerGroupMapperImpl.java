package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.LedgerGroupResponse;
import com.fleetmanagement.entity.LedgerGroup;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-28T09:56:10+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class LedgerGroupMapperImpl implements LedgerGroupMapper {

    @Override
    public LedgerGroupResponse toResponse(LedgerGroup entity) {
        if ( entity == null ) {
            return null;
        }

        LedgerGroupResponse ledgerGroupResponse = new LedgerGroupResponse();

        ledgerGroupResponse.setParentGroupId( entityParentGroupId( entity ) );
        ledgerGroupResponse.setId( entity.getId() );
        ledgerGroupResponse.setName( entity.getName() );
        if ( entity.getNature() != null ) {
            ledgerGroupResponse.setNature( entity.getNature().name() );
        }
        if ( entity.getDefaultAccountSubType() != null ) {
            ledgerGroupResponse.setDefaultAccountSubType( entity.getDefaultAccountSubType().name() );
        }
        ledgerGroupResponse.setTallyGroupName( entity.getTallyGroupName() );

        return ledgerGroupResponse;
    }

    private UUID entityParentGroupId(LedgerGroup ledgerGroup) {
        LedgerGroup parentGroup = ledgerGroup.getParentGroup();
        if ( parentGroup == null ) {
            return null;
        }
        return parentGroup.getId();
    }
}
