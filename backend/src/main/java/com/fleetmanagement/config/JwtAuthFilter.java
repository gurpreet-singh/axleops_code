package com.fleetmanagement.config;

import com.fleetmanagement.entity.User;
import com.fleetmanagement.service.AuthService;
import com.fleetmanagement.service.JwtService;
import com.fleetmanagement.service.RedisSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * JWT Authentication Filter — validates the Bearer token on every request.
 * 
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Check session exists in Redis
 * 3. Validate JWT signature + expiry
 * 4. Set SecurityContext with authenticated user
 * 5. Set TenantContext from the session data
 */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final RedisSessionService redisSessionService;
    private final AuthService authService;

    public JwtAuthFilter(JwtService jwtService,
                         RedisSessionService redisSessionService,
                         AuthService authService) {
        this.jwtService = jwtService;
        this.redisSessionService = redisSessionService;
        this.authService = authService;
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

            // 3. Extract user info from Redis session
            Map<String, String> sessionData = redisSessionService.getSession(token);
            if (sessionData == null) {
                filterChain.doFilter(request, response);
                return;
            }

            UUID userId = UUID.fromString(sessionData.get("userId"));
            UUID tenantId = UUID.fromString(sessionData.get("tenantId"));
            String role = sessionData.get("role");

            // 4. Set TenantContext (replaces the old hardcoded value)
            TenantContext.set(tenantId);

            // 5. Set Spring Security authentication context
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userId.toString(),
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

        } catch (Exception e) {
            // Token is invalid — continue without authentication
            // The security chain will return 401 on protected endpoints
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clean up ThreadLocal
            TenantContext.clear();
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Don't filter the login endpoint
        return path.equals("/auth/login");
    }
}