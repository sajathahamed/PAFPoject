package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.MessageResponse;
import com.smartcampus.auth.dto.TokenResponse;
import com.smartcampus.auth.dto.UserDTO;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.exception.InvalidTokenException;
import com.smartcampus.auth.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
     * Get the currently authenticated user's profile.
     * 
     * @return UserDTO with user profile and role
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        User user = authService.getCurrentUser();
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
}
