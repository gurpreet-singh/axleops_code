package com.fleetmanagement.controller;

import com.fleetmanagement.config.RequiresAuthority;
import com.fleetmanagement.dto.response.UserResponse;
import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.entity.Role;
import com.fleetmanagement.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @RequiresAuthority(Authority.USER_READ)
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String role) {
        if (role != null && !role.isBlank()) {
            try {
                Role r = Role.valueOf(role.toUpperCase());
                return ResponseEntity.ok(userService.getUsersByRole(r));
            } catch (IllegalArgumentException e) {
                // Invalid role name — fall through to return all
            }
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @RequiresAuthority(Authority.USER_READ)
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}