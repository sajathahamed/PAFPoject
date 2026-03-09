package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.exception.InvalidTokenException;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.RefreshTokenRepository;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service handling authentication operations.
 * 
 * Provides:
 * - Current user retrieval from security context
 * - Token refresh functionality
 * - Logout with token revocation
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    /**
     * Get the currently authenticated user from the security context.
     * 
     * @return the authenticated User entity
     * @throws ResourceNotFoundException if user is not found or not authenticated
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        
        if (principal instanceof User) {
            return (User) principal;
        }
        
        throw new ResourceNotFoundException("User not found in security context");
    }

    /**
     * Refresh the access token using a valid refresh token.
     * Implements token rotation: old refresh token is revoked, new one is issued.
     * 
     * @param refreshTokenValue the refresh token string
     * @param response HTTP response for setting cookies
     * @return new token response with access token
     * @throws InvalidTokenException if refresh token is invalid or expired
     */
    @Transactional
    public TokenResponse refreshTokens(String refreshTokenValue, HttpServletResponse response) {
        // Find refresh token in database
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        // Validate token is not revoked or expired
        if (!storedToken.isValid()) {
            throw new InvalidTokenException("Refresh token has expired or been revoked");
        }

        User user = storedToken.getUser();

        // Revoke the used refresh token (token rotation)
        storedToken.revoke();
        refreshTokenRepository.save(storedToken);

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = generateAndStoreRefreshToken(user);

        // Set cookies
        addTokenCookie(response, "accessToken", newAccessToken, 15 * 60);
        addTokenCookie(response, "refreshToken", newRefreshToken, 7 * 24 * 60 * 60);

        log.info("Tokens refreshed for user: {}", user.getEmail());

        return new TokenResponse(newAccessToken, "Bearer", 900); // 15 minutes
    }

    /**
     * Logout user by revoking their refresh token and clearing cookies.
     * 
     * @param refreshTokenValue the refresh token to revoke
     * @param response HTTP response for clearing cookies
     */
    @Transactional
    public void logout(String refreshTokenValue, HttpServletResponse response) {
        if (refreshTokenValue != null) {
            refreshTokenRepository.findByToken(refreshTokenValue)
                    .ifPresent(token -> {
                        token.revoke();
                        refreshTokenRepository.save(token);
                        log.info("Refresh token revoked for user: {}", token.getUser().getEmail());
                    });
        }

        // Clear cookies
        clearCookie(response, "accessToken");
        clearCookie(response, "refreshToken");
    }

    /**
     * Generate a new refresh token and store it in the database.
     */
    private String generateAndStoreRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        
        RefreshToken refreshToken = RefreshToken.builder()
                .token(tokenValue)
                .user(user)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000))
                .revoked(false)
                .build();
        
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    /**
     * Add a token cookie to the response.
     */
    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Set to true in production
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
        
        // Add with SameSite attribute
        String headerValue = String.format("%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax", 
                                           name, value, maxAgeSeconds);
        response.addHeader("Set-Cookie", headerValue);
    }

    /**
     * Clear a cookie by setting max age to 0.
     */
    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        // Clear with SameSite attribute
        String headerValue = String.format("%s=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax", name);
        response.addHeader("Set-Cookie", headerValue);
    }
}
