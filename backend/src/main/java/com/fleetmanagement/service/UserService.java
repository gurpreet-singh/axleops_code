package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.UserResponse;
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
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getUsersByTenant(UUID tenantId) {
        return userRepository.findByTenantId(tenantId).stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }
}