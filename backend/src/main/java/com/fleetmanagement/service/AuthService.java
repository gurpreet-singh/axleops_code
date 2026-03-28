package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.AuthUserResponse;
import com.fleetmanagement.dto.response.LoginResponse;
import com.fleetmanagement.entity.User;
import com.fleetmanagement.repository.TenantRepository;
import com.fleetmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Handles authentication: login, session creation, user profile building.
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RedisSessionService redisSessionService;

    public AuthService(UserRepository userRepository,
                       TenantRepository tenantRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RedisSessionService redisSessionService) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.redisSessionService = redisSessionService;
    }

    /**
     * Authenticate user by username (email field) and password.
     * During development, we accept both BCrypt-hashed and plain-text passwords.
     */
    public LoginResponse login(String username, String password) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Check password — support both BCrypt and plain-text during development
        boolean passwordMatch = false;
        if (user.getPassword() != null) {
            if (user.getPassword().startsWith("$2a$") || user.getPassword().startsWith("$2b$")) {
                // BCrypt encoded password
                passwordMatch = passwordEncoder.matches(password, user.getPassword());
            } else {
                // Plain-text password (dev mode)
                passwordMatch = password.equals(user.getPassword());
            }
        }

        if (!passwordMatch) {
            throw new RuntimeException("Invalid username or password");
        }

        UUID branchId = user.getBranch() != null ? user.getBranch().getId() : null;

        // Generate JWT token
        String token = jwtService.generateToken(
                user.getId(),
                user.getTenantId(),
                user.getRole(),
                branchId
        );

        // Store session in Redis
        redisSessionService.createSession(token, user.getId(), user.getTenantId(), user.getRole(), branchId);

        return LoginResponse.builder()
                .token(token)
                .user(buildAuthUserResponse(user))
                .build();
    }

    /**
     * Logout — invalidate session in Redis.
     */
    public void logout(String token) {
        redisSessionService.invalidateSession(token);
    }

    /**
     * Get current user profile from a valid token.
     */
    public AuthUserResponse getCurrentUser(String token) {
        UUID userId = jwtService.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildAuthUserResponse(user);
    }

    /**
     * Find user by ID (used by JWT filter to set security context).
     */
    public User findUserById(UUID userId) {
        return userRepository.findById(userId).orElse(null);
    }

    /**
     * Build the auth user response DTO with tenant and branch names.
     */
    private AuthUserResponse buildAuthUserResponse(User user) {
        String tenantName = "";
        if (user.getTenantId() != null) {
            tenantName = tenantRepository.findById(user.getTenantId())
                    .map(t -> t.getName())
                    .orElse("");
        }

        String branchName = "";
        UUID branchId = null;
        if (user.getBranch() != null) {
            branchId = user.getBranch().getId();
            branchName = user.getBranch().getName();
        }

        return AuthUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .title(user.getTitle())
                .tenantId(user.getTenantId())
                .tenantName(tenantName)
                .branchId(branchId)
                .branchName(branchName)
                .build();
    }
}
