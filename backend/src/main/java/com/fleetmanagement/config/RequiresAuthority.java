package com.fleetmanagement.config;

import com.fleetmanagement.entity.Authority;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declarative authority check for controller methods.
 * Usage: @RequiresAuthority(Authority.TRIP_CREATE)
 *
 * <p>The {@link AuthorityAspect} reads this annotation and throws
 * AccessDeniedException if the authenticated user lacks the required authority.</p>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresAuthority {
    Authority value();
}
