package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.UserResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.User;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-03T07:45:50+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        if ( user == null ) {
            return null;
        }

        UserResponse userResponse = new UserResponse();

        userResponse.setBranchId( userBranchId( user ) );
        userResponse.setBranchName( userBranchName( user ) );
        userResponse.setRoles( rolesToStrings( user.getRoles() ) );
        userResponse.setId( user.getId() );
        userResponse.setFirstName( user.getFirstName() );
        userResponse.setLastName( user.getLastName() );
        userResponse.setUsername( user.getUsername() );
        userResponse.setEmail( user.getEmail() );
        userResponse.setPhone( user.getPhone() );
        userResponse.setTitle( user.getTitle() );
        userResponse.setStatus( user.getStatus() );
        userResponse.setLoginEnabled( user.isLoginEnabled() );
        userResponse.setActive( user.isActive() );

        return userResponse;
    }

    private UUID userBranchId(User user) {
        Branch branch = user.getBranch();
        if ( branch == null ) {
            return null;
        }
        return branch.getId();
    }

    private String userBranchName(User user) {
        Branch branch = user.getBranch();
        if ( branch == null ) {
            return null;
        }
        return branch.getName();
    }
}
