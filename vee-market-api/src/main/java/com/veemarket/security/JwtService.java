package com.veemarket.security;

import com.veemarket.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private static final long EXPIRATION_MS =
            1000L * 60 * 60 * 24;

    private final SecretKey key;

    public JwtService() {
        String secret = System.getenv("JWT_SECRET");

        if (secret == null || secret.isBlank()) {
            secret = "your_secure_jwt_secretmarket-jwt-secret-2026-development-key-very-secure-123456";
        }

        key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(User user) {

        Instant now = Instant.now();

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {

        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {

        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}