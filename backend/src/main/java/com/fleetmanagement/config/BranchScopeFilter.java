package com.fleetmanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Branch scoping filter — reads the branch header and sets BranchSecurityContext.
 * TenantContext is now set by JwtAuthFilter from the authenticated user's session.
 */
@Component
public class BranchScopeFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // --- BRANCH SCOPING ---
        String requestedBranch = request.getHeader("X-AxleOps-Branch");

        List<UUID> resolvedBranches = new ArrayList<>();
        if (requestedBranch != null && !requestedBranch.isEmpty()) {
            try {
                resolvedBranches.add(UUID.fromString(requestedBranch));
            } catch (IllegalArgumentException e) {
                // Invalid UUID — skip
            }
        }

        BranchSecurityContext.set(resolvedBranches);

        try {
            filterChain.doFilter(request, response);
        } finally {
            BranchSecurityContext.clear();
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/auth/login");
    }
}