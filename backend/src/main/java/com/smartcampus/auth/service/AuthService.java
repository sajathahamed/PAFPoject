package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.LoginRequest;
import com.smartcampus.auth.dto.RegisterRequest;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.entity.Role;
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
import org.springframework.security.crypto.password.PasswordEncoder;
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
@SuppressWarnings("unused")
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    /**
     * Register a new user with email and password.
     */
    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("LOCAL")
                .providerId(request.getEmail())
                .role(Role.STUDENT)
                .build();

        log.info("New user registered: {}", user.getEmail());
        return userRepository.save(user);
    }

    /**
     * Login user with email and password.
     */
    @Transactional
    public TokenResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidTokenException("Invalid email or password"));

        if (user.getPassword() == null) {
            throw new InvalidTokenException(
                    "This account signs in with Google. Use \"Continue with Google\" below.");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidTokenException("Invalid email or password");
        }

        user.updateLastLogin();
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = generateAndStoreRefreshToken(user);

        addTokenCookie(response, "accessToken", accessToken, 15 * 60);
        addTokenCookie(response, "refreshToken", refreshToken, 7 * 24 * 60 * 60);

        log.info("User logged in: {}", user.getEmail());
        return new TokenResponse(accessToken, "Bearer", 900);
    }

    /**
     * Get the currently authenticated user from the security context.
     * 
     * @return the authenticated User entity, or null if not authenticated
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        log.debug("Authentication: {}", authentication);
        log.debug("Is authenticated: {}", authentication != null ? authentication.isAuthenticated() : "N/A");
        log.debug("Principal: {}", authentication != null ? authentication.getPrincipal() : "N/A");
        
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            log.warn("User not authenticated - returning null");
            return null;
        }

        Object principal = authentication.getPrincipal();
        log.debug("Principal type: {}", principal != null ? principal.getClass().getName() : "N/A");
        
        if (principal instanceof User) {
            log.debug("Principal is already a User entity");
            return (User) principal;
        }
        
        // If it's a string (email from the token), find it in DB
        if (principal instanceof String) {
            String email = (String) principal;
            log.debug("Looking up user by email: {}", email);
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                log.warn("User not found in database for email: {}", email);
            } else {
                log.debug("User found: {}", user.getEmail());
            }
            return user;
        }
        
        return null;
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
     * Update the current user's profile (name and email).
     */
    @Transactional
    public User updateProfile(String name, String email) {
        User user = getCurrentUser();
        log.debug("Current user for profile update: {}", user);
        if (user == null) {
            log.error("User is null - not authenticated");
            throw new RuntimeException("User not authenticated");
        }
        if (name != null && !name.isBlank()) {
            user.setName(name);
        }
        if (email != null && !email.isBlank()) {
            user.setEmail(email);
        }
        log.info("Profile updated for user: {}", user.getEmail());
        return userRepository.save(user);
    }

    /**
     * Update the current user's profile picture.
     */
    @Transactional
    public User updateProfilePicture(String picture) {
        User user = getCurrentUser();
        log.debug("Current user for picture update: {}", user);
        if (user == null) {
            log.error("User is null - not authenticated");
            throw new RuntimeException("User not authenticated");
        }
        user.setProfilePicture(picture);
        log.info("Profile picture updated for user: {}", user.getEmail());
        return userRepository.save(user);
    }

    /**
     * Change the current user's password.
     */
    @Transactional
    public void changePassword(String oldPassword, String newPassword) {
        User user = getCurrentUser();
        log.debug("Current user for password change: {}", user);
        if (user == null) {
            log.error("User is null - not authenticated");
            throw new RuntimeException("User not authenticated");
        }
        
        if (user.getPassword() == null) {
            throw new RuntimeException("Cannot change password for OAuth users");
        }
        
        if (oldPassword == null || oldPassword.isBlank()) {
            throw new RuntimeException("Current password is required");
        }
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
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

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token saved with ID: {}", saved.getId());
        return tokenValue;
    }

    /**
     * Add a token cookie to the response.
     */
    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        String cookieHeader = String.format(
                "%s=%s; Path=/; Max-Age=%d; HttpOnly; SameSite=Lax",
                name, value, maxAgeSeconds);
        log.debug("Setting cookie: {}", cookieHeader);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    /**
     * Clear a cookie by setting max age to 0.
     */
    private void clearCookie(HttpServletResponse response, String name) {
        String cookieHeader = String.format("%s=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax", name);
        log.debug("Clearing cookie: {}", cookieHeader);
        response.addHeader("Set-Cookie", cookieHeader);
    }
}
