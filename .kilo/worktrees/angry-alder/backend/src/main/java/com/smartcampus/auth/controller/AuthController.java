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
        log.debug("Received login request for email: {}", request.getEmail());
        TokenResponse tokenResponse = authService.login(request, response);
        return ResponseEntity.ok(tokenResponse);
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
    @DeleteMapping("/logout")
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

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        log.info("Updating profile for current user");
        User user = authService.updateProfile(request.getName(), request.getEmail());
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    @PutMapping("/profile-picture")
    public ResponseEntity<MessageResponse> updateProfilePicture(@RequestBody ProfilePictureRequest request) {
        log.info("Updating profile picture for current user");
        authService.updateProfilePicture(request.getPicture());
        return ResponseEntity.ok(MessageResponse.of("Profile picture updated successfully"));
    }

    public record ProfilePictureRequest(String picture) {}

    @PostMapping("/change-password")
    public ResponseEntity<MessageResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        log.info("Changing password for current user");
        authService.changePassword(request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.ok(MessageResponse.of("Password changed successfully"));
    }

    public record ChangePasswordRequest(String oldPassword, String newPassword) {}
}
