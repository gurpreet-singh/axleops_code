package com.fleetmanagement.service;

import com.fleetmanagement.dto.response.AuthUserResponse;
import com.fleetmanagement.dto.response.LoginResponse;
import com.fleetmanagement.dto.response.RoleInfo;
import com.fleetmanagement.entity.*;
import com.fleetmanagement.repository.BranchRepository;
import com.fleetmanagement.repository.PlatformAdminRepository;
import com.fleetmanagement.repository.TenantRepository;
import com.fleetmanagement.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles authentication: login, role selection, session management, user profile.
 *
 * <p>Login flow:</p>
 * <ol>
 *   <li>User authenticates with username + password</li>
 *   <li>If user has 1 role → JWT generated with that role's authorities</li>
 *   <li>If user has multiple roles → JWT generated with ALL authorities (role selector shown on frontend)</li>
 *   <li>User can call /select-role to get a scoped JWT for a specific role</li>
 * </ol>
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PlatformAdminRepository platformAdminRepository;
    private final TenantRepository tenantRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RedisSessionService redisSessionService;

    public AuthService(UserRepository userRepository,
                       PlatformAdminRepository platformAdminRepository,
                       TenantRepository tenantRepository,
                       BranchRepository branchRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RedisSessionService redisSessionService) {
        this.userRepository = userRepository;
        this.platformAdminRepository = platformAdminRepository;
        this.tenantRepository = tenantRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.redisSessionService = redisSessionService;
    }

    // ─── Tenant User Login ──────────────────────────────────

    /**
     * Authenticate a tenant user. Returns JWT with all roles' authorities combined.
     * Frontend shows role selector if user has multiple roles.
     */
    @Transactional
    public LoginResponse login(String username, String password) {
        // Try tenant user first
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null) {
            return loginTenantUser(user, password);
        }

        // Try platform admin
        PlatformAdmin admin = platformAdminRepository.findByEmail(username).orElse(null);
        if (admin != null) {
            return loginPlatformAdmin(admin, password);
        }

        throw new RuntimeException("Invalid username or password");
    }

    private LoginResponse loginTenantUser(User user, String password) {
        verifyPassword(password, user.getPassword());

        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT with ALL roles and ALL authorities
        Set<Role> allRoles = user.getRoles();
        Set<Authority> allAuthorities = user.getEffectiveAuthorities();

        String token = jwtService.generateTenantToken(user, allRoles, allAuthorities);
        UUID branchId = user.getBranch() != null ? user.getBranch().getId() : null;

        // Store session in Redis
        List<String> roleNames = allRoles.stream().map(Enum::name).collect(Collectors.toList());
        redisSessionService.createSession(token, user.getId(), user.getTenantId(),
                roleNames, branchId, "TENANT",
                user.getUsername(), user.getEmail(), user.getPhone());

        return LoginResponse.builder()
                .token(token)
                .user(buildTenantUserResponse(user, allRoles, allAuthorities))
                .build();
    }

    private LoginResponse loginPlatformAdmin(PlatformAdmin admin, String password) {
        verifyPassword(password, admin.getPassword());

        if (!admin.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        String token = jwtService.generatePlatformToken(admin);

        // Store session in Redis
        redisSessionService.createSession(token, admin.getId(), null,
                List.of("PLATFORM_ADMIN"), null, "PLATFORM",
                admin.getEmail(), admin.getEmail(), null);

        return LoginResponse.builder()
                .token(token)
                .user(buildPlatformUserResponse(admin))
                .build();
    }

    // ─── Role Selection ─────────────────────────────────────

    /**
     * Generate a new JWT scoped to a specific role.
     * Called from the role selector screen.
     *
     * @param userId   The authenticated user's ID
     * @param roleCode The enum name of the role, or "ALL" for combined access
     */
    @Transactional
    public LoginResponse selectRole(UUID userId, String roleCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> activeRoles;
        Set<Authority> authorities;

        if ("ALL".equals(roleCode)) {
            // Combined: all roles, all authorities
            activeRoles = user.getRoles();
            authorities = user.getEffectiveAuthorities();
        } else {
            // Specific role
            Role selected = Role.valueOf(roleCode);
            if (!user.getRoles().contains(selected)) {
                throw new RuntimeException("Role not assigned to user: " + roleCode);
            }
            activeRoles = EnumSet.of(selected);
            authorities = selected.getAuthorities();
        }

        String token = jwtService.generateTenantToken(user, activeRoles, authorities);
        UUID branchId = user.getBranch() != null ? user.getBranch().getId() : null;

        List<String> roleNames = activeRoles.stream().map(Enum::name).collect(Collectors.toList());
        redisSessionService.createSession(token, user.getId(), user.getTenantId(),
                roleNames, branchId, "TENANT",
                user.getUsername(), user.getEmail(), user.getPhone());

        return LoginResponse.builder()
                .token(token)
                .user(buildTenantUserResponse(user, activeRoles, authorities))
                .build();
    }

    // ─── Logout ─────────────────────────────────────────────

    public void logout(String token) {
        redisSessionService.invalidateSession(token);
    }

    // ─── Current User Profile ───────────────────────────────

    /**
     * Get the current user profile from a valid token.
     * Returns full role and authority information.
     */
    public AuthUserResponse getCurrentUser(String token) {
        UUID userId = jwtService.extractUserId(token);
        String type = jwtService.extractType(token);

        if ("PLATFORM".equals(type)) {
            PlatformAdmin admin = platformAdminRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Platform admin not found"));
            return buildPlatformUserResponse(admin);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Rebuild authorities from the roles in the JWT (not all roles)
        List<String> jwtRoles = jwtService.extractRoles(token);
        Set<Role> activeRoles = jwtRoles.stream()
                .map(r -> {
                    try { return Role.valueOf(r); }
                    catch (IllegalArgumentException e) { return null; }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(Role.class)));

        Set<Authority> authorities = activeRoles.stream()
                .flatMap(r -> r.getAuthorities().stream())
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(Authority.class)));

        return buildTenantUserResponse(user, activeRoles, authorities);
    }

    // ─── Helpers ────────────────────────────────────────────

    public User findUserById(UUID userId) {
        return userRepository.findById(userId).orElse(null);
    }

    private void verifyPassword(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            throw new RuntimeException("Invalid username or password");
        }

        boolean match;
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$")) {
            match = passwordEncoder.matches(rawPassword, storedPassword);
        } else {
            // Plain-text password (dev mode)
            match = rawPassword.equals(storedPassword);
        }

        if (!match) {
            throw new RuntimeException("Invalid username or password");
        }
    }

    private AuthUserResponse buildTenantUserResponse(User user, Set<Role> activeRoles,
                                                      Set<Authority> authorities) {
        String tenantName = "";
        if (user.getTenantId() != null) {
            tenantName = tenantRepository.findById(user.getTenantId())
                    .map(t -> t.getName())
                    .orElse("");
        }

        UUID branchId = null;
        String branchCode = null;
        String branchName = null;
        if (user.getBranch() != null) {
            branchId = user.getBranch().getId();
            branchCode = user.getBranch().getCode();
            branchName = user.getBranch().getName();
        }

        // Branch context: count and list of all branches
        List<Branch> activeBranches = user.getTenantId() != null
                ? branchRepository.findByTenantIdAndActiveTrueOrderBySortOrderAsc(user.getTenantId())
                : List.of();
        int branchCount = activeBranches.size();

        // For tenant-wide users: all branches. For branch-scoped: only their branch.
        List<AuthUserResponse.BranchSummary> allBranches;
        if (branchId == null) {
            // Tenant-wide user sees all branches
            allBranches = activeBranches.stream()
                    .map(b -> AuthUserResponse.BranchSummary.builder()
                            .id(b.getId())
                            .code(b.getCode())
                            .name(b.getName())
                            .build())
                    .collect(Collectors.toList());
        } else {
            // Branch-scoped user sees only their branch
            allBranches = List.of(AuthUserResponse.BranchSummary.builder()
                    .id(branchId)
                    .code(branchCode)
                    .name(branchName)
                    .build());
        }

        // Build role info list (all assigned roles, not just active)
        List<RoleInfo> allRoleInfos = user.getRoles().stream()
                .map(r -> RoleInfo.builder()
                        .code(r.name())
                        .displayName(r.getDisplayName())
                        .department(r.getDepartment())
                        .build())
                .sorted(Comparator.comparing(RoleInfo::getCode))
                .collect(Collectors.toList());

        // Authority list from active roles
        List<String> authorityNames = authorities.stream()
                .map(Enum::name)
                .sorted()
                .collect(Collectors.toList());

        return AuthUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .tenantId(user.getTenantId())
                .tenantName(tenantName)
                .branchId(branchId)
                .branchCode(branchCode)
                .branchName(branchName)
                .branchCount(branchCount)
                .allBranches(allBranches)
                .roles(allRoleInfos)
                .authorities(authorityNames)
                .type("TENANT")
                .build();
    }

    private AuthUserResponse buildPlatformUserResponse(PlatformAdmin admin) {
        RoleInfo roleInfo = RoleInfo.builder()
                .code("PLATFORM_ADMIN")
                .displayName("Platform Admin")
                .department("Platform Management")
                .build();

        return AuthUserResponse.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .email(admin.getEmail())
                .roles(List.of(roleInfo))
                .authorities(List.of())
                .type("PLATFORM")
                .build();
    }
}
