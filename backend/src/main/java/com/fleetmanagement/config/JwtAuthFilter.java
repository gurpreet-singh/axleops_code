package com.fleetmanagement.config;

import com.fleetmanagement.service.JwtService;
import com.fleetmanagement.service.RedisSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * JWT Authentication Filter — validates the Bearer token on every request.
 *
 * <p>Supports two token types via the 'type' claim:</p>
 * <ul>
 *   <li>PLATFORM — grants ROLE_PLATFORM authority (platform admin endpoints)</li>
 *   <li>TENANT — grants ROLE_TENANT + all fine-grained authorities from the token</li>
 * </ul>
 *
 * <p>Authorities are embedded in the JWT at login time, so this filter never
 * needs to hit the database to check permissions.</p>
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final RedisSessionService redisSessionService;

    public JwtAuthFilter(JwtService jwtService,
                         RedisSessionService redisSessionService) {
        this.jwtService = jwtService;
        this.redisSessionService = redisSessionService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        // No token → let the security chain decide (will 401 on protected endpoints)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);

        try {
            // 1. Validate JWT signature + expiry
            if (!jwtService.isTokenValid(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 2. Check Redis session exists (allows server-side revocation)
            if (!redisSessionService.isSessionValid(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 3. Extract claims from JWT (not from Redis — JWT is the source of truth)
            String type = jwtService.extractType(token);
            UUID userId = jwtService.extractUserId(token);

            List<GrantedAuthority> grantedAuthorities = new ArrayList<>();

            if ("PLATFORM".equals(type)) {
                // Platform admin — coarse-grained authority only
                grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_PLATFORM"));

                // Set authentication with simple principal
                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        userId.toString(), null, grantedAuthorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

            } else if ("TENANT".equals(type)) {
                // Tenant user — fine-grained authorities from JWT
                grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_TENANT"));

                List<String> authorities = jwtService.extractAuthorities(token);
                for (String authority : authorities) {
                    grantedAuthorities.add(new SimpleGrantedAuthority(authority));
                }

                UUID tenantId = jwtService.extractTenantId(token);
                UUID branchId = jwtService.extractBranchId(token);

                // Set TenantContext for downstream services
                TenantContext.set(tenantId);

                // Build TenantPrincipal with full context
                TenantPrincipal principal = new TenantPrincipal(userId, tenantId, branchId);

                UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                        principal, null, grantedAuthorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

        } catch (Exception e) {
            // Token is invalid — continue without authentication
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/auth/login") || path.equals("/auth/platform-login");
    }
}