package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.BranchResponse;
import com.fleetmanagement.entity.Branch;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T07:21:23+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class BranchMapperImpl implements BranchMapper {

    @Override
    public BranchResponse toResponse(Branch branch) {
        if ( branch == null ) {
            return null;
        }

        BranchResponse branchResponse = new BranchResponse();

        branchResponse.setTenantId( branch.getTenantId() );
        branchResponse.setId( branch.getId() );
        branchResponse.setName( branch.getName() );
        branchResponse.setCity( branch.getCity() );
        branchResponse.setState( branch.getState() );
        branchResponse.setAddress( branch.getAddress() );
        branchResponse.setPhone( branch.getPhone() );
        branchResponse.setEmail( branch.getEmail() );
        branchResponse.setIsPrimary( branch.getIsPrimary() );
        branchResponse.setStatus( branch.getStatus() );

        return branchResponse;
    }
}
