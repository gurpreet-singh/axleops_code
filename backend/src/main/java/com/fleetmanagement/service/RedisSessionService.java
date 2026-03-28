package com.fleetmanagement.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/**
 * Manages user sessions in Redis.
 * Each session maps a JWT token to the user's context (userId, tenantId, role, branchId).
 */
@Service
public class RedisSessionService {

    private static final String SESSION_PREFIX = "axleops:session:";
    private static final Duration SESSION_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisSessionService(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Store a session in Redis keyed by the JWT token.
     */
    public void createSession(String token, UUID userId, UUID tenantId, String role, UUID branchId) {
        Map<String, String> sessionData = Map.of(
                "userId", userId.toString(),
                "tenantId", tenantId.toString(),
                "role", role,
                "branchId", branchId != null ? branchId.toString() : "",
                "loginTime", String.valueOf(System.currentTimeMillis())
        );

        try {
            String json = objectMapper.writeValueAsString(sessionData);
            redisTemplate.opsForValue().set(SESSION_PREFIX + token, json, SESSION_TTL);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize session data", e);
        }
    }

    /**
     * Retrieve session data from Redis. Returns null if session doesn't exist or is expired.
     */
    public Map<String, String> getSession(String token) {
        String json = redisTemplate.opsForValue().get(SESSION_PREFIX + token);
        if (json == null) return null;

        try {
            @SuppressWarnings("unchecked")
            Map<String, String> sessionData = objectMapper.readValue(json, Map.class);
            return sessionData;
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    /**
     * Invalidate a session (logout).
     */
    public void invalidateSession(String token) {
        redisTemplate.delete(SESSION_PREFIX + token);
    }

    /**
     * Check if a session exists and is valid.
     */
    public boolean isSessionValid(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(SESSION_PREFIX + token));
    }
}
