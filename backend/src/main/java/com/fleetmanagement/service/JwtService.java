package com.fleetmanagement.service;

import com.fleetmanagement.entity.Authority;
import com.fleetmanagement.entity.PlatformAdmin;
import com.fleetmanagement.entity.Role;
import com.fleetmanagement.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * JWT token generation and validation.
 * Two token types: PLATFORM (admin) and TENANT (fleet user).
 * Tenant tokens carry roles[] and flattened authorities[] for stateless auth.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // ─── Tenant User Token ──────────────────────────────────

    /**
     * Generate a JWT for a tenant user with specific roles and authorities.
     */
    public String generateTenantToken(User user, Set<Role> activeRoles, Set<Authority> authorities) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        UUID branchId = user.getBranch() != null ? user.getBranch().getId() : null;
        String branchCode = user.getBranch() != null ? user.getBranch().getCode() : null;

        List<String> roleNames = activeRoles.stream()
                .map(Enum::name)
                .sorted()
                .collect(Collectors.toList());

        List<String> authorityNames = authorities.stream()
                .map(Enum::name)
                .sorted()
                .collect(Collectors.toList());

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("type", "TENANT");
        claims.put("tenantId", user.getTenantId().toString());
        claims.put("branchId", branchId != null ? branchId.toString() : "");
        claims.put("branchCode", branchCode != null ? branchCode : "");
        claims.put("roles", roleNames);
        claims.put("authorities", authorityNames);

        return Jwts.builder()
                .subject(user.getId().toString())
                .claims(claims)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    // ─── Platform Admin Token ───────────────────────────────

    /**
     * Generate a JWT for a platform admin.
     */
    public String generatePlatformToken(PlatformAdmin admin) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("type", "PLATFORM");
        claims.put("role", admin.getRole().name());

        return Jwts.builder()
                .subject(admin.getId().toString())
                .claims(claims)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    // ─── Legacy compatibility — single role token ───────────

    /**
     * @deprecated Use generateTenantToken instead.
     */
    @Deprecated
    public String generateToken(UUID userId, UUID tenantId, String role, UUID branchId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of(
                        "type", "TENANT",
                        "tenantId", tenantId.toString(),
                        "role", role,
                        "branchId", branchId != null ? branchId.toString() : "",
                        "roles", List.of(role),
                        "authorities", List.of()
                ))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    // ─── Token Parsing ──────────────────────────────────────

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaims(token).getSubject());
    }

    public String extractType(String token) {
        return extractClaims(token).get("type", String.class);
    }

    public UUID extractTenantId(String token) {
        String tid = extractClaims(token).get("tenantId", String.class);
        return (tid != null && !tid.isEmpty()) ? UUID.fromString(tid) : null;
    }

    public UUID extractBranchId(String token) {
        String branchId = extractClaims(token).get("branchId", String.class);
        return (branchId != null && !branchId.isEmpty()) ? UUID.fromString(branchId) : null;
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = extractClaims(token).get("roles");
        if (roles instanceof List) return (List<String>) roles;
        // Legacy: single role
        String role = extractClaims(token).get("role", String.class);
        return role != null ? List.of(role) : List.of();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractAuthorities(String token) {
        Object auths = extractClaims(token).get("authorities");
        if (auths instanceof List) return (List<String>) auths;
        return List.of();
    }

    /**
     * @deprecated Use extractRoles instead.
     */
    @Deprecated
    public String extractRole(String token) {
        List<String> roles = extractRoles(token);
        return roles.isEmpty() ? null : roles.get(0);
    }
}
