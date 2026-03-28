package com.fleetmanagement.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private AuthUserResponse user;
}
