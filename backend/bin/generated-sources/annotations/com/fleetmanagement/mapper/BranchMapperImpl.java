package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.entity.Branch;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:58:42+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class BranchMapperImpl implements BranchMapper {

    @Override
    public BranchResponse toResponse(Branch branch) {
        if ( branch == null ) {
            return null;
        }

        BranchResponse.BranchResponseBuilder branchResponse = BranchResponse.builder();

        branchResponse.id( branch.getId() );
        branchResponse.code( branch.getCode() );
        branchResponse.name( branch.getName() );
        branchResponse.city( branch.getCity() );
        branchResponse.state( branch.getState() );
        branchResponse.stateCode( branch.getStateCode() );
        branchResponse.address( branch.getAddress() );
        branchResponse.phone( branch.getPhone() );
        branchResponse.email( branch.getEmail() );
        branchResponse.gstin( branch.getGstin() );
        branchResponse.managerId( branch.getManagerId() );
        branchResponse.headquarters( branch.isHeadquarters() );
        branchResponse.active( branch.isActive() );
        branchResponse.sortOrder( branch.getSortOrder() );

        return branchResponse.build();
    }
}
