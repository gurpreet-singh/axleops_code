package com.fleetmanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class BranchScopeFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // --- MULTI-TENANCY ---
        // Hardcoded demo tenant — valid UUID for dev mode
        TenantContext.set(null);


        // --- BRANCH SCOPING ---
        String requestedBranch = request.getHeader("X-AxleOps-Branch");

        List<UUID> resolvedBranches = new ArrayList<>();
        if (requestedBranch != null && !requestedBranch.isEmpty()) {
            resolvedBranches.add(UUID.fromString(requestedBranch));
        }

        BranchSecurityContext.set(resolvedBranches);

        try {
            filterChain.doFilter(request, response);
        } finally {
            BranchSecurityContext.clear();
            TenantContext.clear();
        }
    }
}