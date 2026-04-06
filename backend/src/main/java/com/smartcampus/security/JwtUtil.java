package com.smartcampus.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    public String generateToken(String userId, String email, String role) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        return JWT.create()
                .withSubject(userId)
                .withClaim("email", email)
                .withClaim("role", role)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + expirationMs))
                .sign(algorithm);
    }

    public DecodedJWT verify(String token) throws JWTVerificationException {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        JWTVerifier verifier = JWT.require(algorithm).build();
        return verifier.verify(token);
    }

    public String extractUserId(String token) {
        return verify(token).getSubject();
    }

    public String extractEmail(String token) {
        return verify(token).getClaim("email").asString();
    }

    public String extractRole(String token) {
        return verify(token).getClaim("role").asString();
    }

    public boolean isTokenValid(String token) {
        try {
            verify(token);
            return true;
        } catch (JWTVerificationException e) {
            return false;
        }
    }
}
