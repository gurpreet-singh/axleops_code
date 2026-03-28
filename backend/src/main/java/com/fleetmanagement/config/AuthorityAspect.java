package com.fleetmanagement.config;

import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * AOP aspect that enforces the {@link RequiresAuthority} annotation.
 * Checks the current authentication's granted authorities against the required authority.
 */
@Aspect
@Component
public class AuthorityAspect {

    @Before("@annotation(auth)")
    public void checkAuthority(RequiresAuthority auth) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Not authenticated");
        }

        String required = auth.value().name();

        boolean hasAuthority = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(required));

        if (!hasAuthority) {
            throw new AccessDeniedException("Missing authority: " + required);
        }
    }
}
