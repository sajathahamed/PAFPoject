package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.LoginRequest;
import com.smartcampus.auth.dto.MessageResponse;
import com.smartcampus.auth.dto.ProfileUpdateRequest;
import com.smartcampus.auth.dto.RegisterRequest;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.auth.dto.UserDTO;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.exception.InvalidTokenException;
import com.smartcampus.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication operations.
 * 
 * Endpoints:
 * - GET  /api/auth/me      - Get current authenticated user
 * - POST /api/auth/refresh - Refresh access token
 * - DELETE /api/auth/logout - Logout and invalidate tokens
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user with email and password.
     */
    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Received registration request for email: {}", request.getEmail());
        User user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(user));
    }

    /**
     * Login user with email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        log.info("Received login request for email: {}", request.getEmail());
        log.debug("Request body: email={}", request.getEmail());
        
        try {
            TokenResponse tokenResponse = authService.login(request, response);
            log.info("Login successful for email: {}", request.getEmail());
            return ResponseEntity.ok(tokenResponse);
        } catch (Exception e) {
            log.error("Login failed for email: {} - {}", request.getEmail(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get the currently authenticated user's profile.
     * 
     * @return UserDTO with user profile and role
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.noContent().build();
        }
        log.debug("Fetching current user: {}", user.getEmail());
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Update the current user's profile (name and email).
     * 
     * @param request the profile update request
     * @return Updated UserDTO
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody ProfileUpdateRequest request) {
        try {
            log.info("Updating profile - name: {}, email: {}", request.getName(), request.getEmail());
            User updatedUser = authService.updateProfile(request.getName(), request.getEmail());
            log.info("Profile updated successfully for user: {}", updatedUser.getEmail());
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (Exception e) {
            log.error("Error updating profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update profile: " + e.getMessage()));
        }
    }

    /**
     * Update the current user's profile picture.
     * 
     * @param request the profile picture URL
     * @return Updated UserDTO
     */
    @PutMapping("/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@RequestBody ProfileUpdateRequest request) {
        try {
            log.info("Updating profile picture");
            User updatedUser = authService.updateProfilePicture(request.getPicture());
            log.info("Profile picture updated successfully");
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (Exception e) {
            log.error("Error updating profile picture: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to update profile picture: " + e.getMessage()));
        }
    }

    /**
     * Change the current user's password.
     * 
     * @param request the password change request
     * @return Success message
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ProfileUpdateRequest request) {
        try {
            log.info("Changing password for user");
            authService.changePassword(request.getOldPassword(), request.getNewPassword());
            log.info("Password changed successfully");
            return ResponseEntity.ok(MessageResponse.of("Password changed successfully"));
        } catch (Exception e) {
            log.error("Error changing password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to change password: " + e.getMessage()));
        }
    }

    /**
     * Refresh the access token using the refresh token cookie.
     * Implements token rotation for security.
     * 
     * @param request HTTP request containing refresh token cookie
     * @param response HTTP response for setting new cookies
     * @return TokenResponse with new access token info
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response) {
        
        String refreshToken = extractRefreshTokenFromCookie(request);
        
        if (refreshToken == null) {
            throw new InvalidTokenException("Refresh token not found");
        }

        log.debug("Attempting to refresh tokens");
        TokenResponse tokenResponse = authService.refreshTokens(refreshToken, response);
        
        return ResponseEntity.ok(tokenResponse);
    }

    /**
     * Logout the current user.
     * Revokes refresh token and clears authentication cookies.
     * 
     * @param request HTTP request containing refresh token cookie
     * @param response HTTP response for clearing cookies
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            HttpServletRequest request,
            HttpServletResponse response) {
        
        String refreshToken = extractRefreshTokenFromCookie(request);
        
        log.info("User logout requested");
        authService.logout(refreshToken, response);
        
        return ResponseEntity.ok(MessageResponse.of("Logged out successfully"));
    }

    /**
     * Extract refresh token from HTTP cookie.
     */
    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
}
