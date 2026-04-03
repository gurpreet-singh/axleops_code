package com.fleetmanagement.service;

import com.fleetmanagement.config.ResourceNotFoundException;
import com.fleetmanagement.config.TenantContext;
import com.fleetmanagement.dto.response.UserResponse;
import com.fleetmanagement.entity.Role;
import com.fleetmanagement.mapper.UserMapper;
import com.fleetmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public List<UserResponse> getAllUsers() {
        UUID tenantId = TenantContext.get();
        return userRepository.findByTenantId(tenantId).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByTenant(UUID tenantId) {
        return userRepository.findByTenantId(tenantId).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Fetch users filtered by a specific role within the current tenant.
     */
    public List<UserResponse> getUsersByRole(Role role) {
        UUID tenantId = TenantContext.get();
        return userRepository.findByTenantIdAndRole(tenantId, role).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convenience method: get all users with the DRIVER role.
     */
    public List<UserResponse> getDrivers() {
        return getUsersByRole(Role.DRIVER);
    }

    /**
     * Fetch a single user by ID within the current tenant.
     */
    public UserResponse getUserById(UUID id) {
        UUID tenantId = TenantContext.get();
        return userRepository.findByIdAndTenantId(id, tenantId)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}