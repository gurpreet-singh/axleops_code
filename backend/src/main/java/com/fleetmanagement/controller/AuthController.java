package com.fleetmanagement.controller;

import com.fleetmanagement.config.TenantPrincipal;
import com.fleetmanagement.dto.request.LoginRequest;
import com.fleetmanagement.dto.request.SelectRoleRequest;
import com.fleetmanagement.dto.response.AuthUserResponse;
import com.fleetmanagement.dto.response.LoginResponse;
import com.fleetmanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/v1/auth/login
     * Unified login — works for both tenant users and platform admins.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * POST /api/v1/auth/select-role
     * Generate a new JWT scoped to a specific role.
     * Called from the role selector when user has multiple roles.
     */
    @PostMapping("/select-role")
    public ResponseEntity<LoginResponse> selectRole(@RequestBody SelectRoleRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId;

            if (auth.getPrincipal() instanceof TenantPrincipal tp) {
                userId = tp.userId();
            } else {
                userId = UUID.fromString(auth.getPrincipal().toString());
            }

            LoginResponse response = authService.selectRole(userId, request.getRoleCode());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    /**
     * POST /api/v1/auth/logout
     * Invalidate the current session.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            authService.logout(token);
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /**
     * GET /api/v1/auth/me
     * Return the authenticated user's profile with roles and authorities.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }
        String token = authHeader.substring(7);
        try {
            AuthUserResponse user = authService.getCurrentUser(token);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
