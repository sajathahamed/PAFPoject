package com.smartcampus.auth.controller;

import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController.
 * 
 * Tests the /api/auth/* endpoints with real Spring Security context.
 * Uses H2 in-memory database for isolation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private String validAccessToken;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = User.builder()
                .email("integration-test@smartcampus.edu")
                .name("Integration Test User")
                .provider("GOOGLE")
                .providerId("google-integration-123")
                .role(Role.USER)
                .lastLoginAt(LocalDateTime.now())
                .build();
        testUser = userRepository.save(testUser);

        // Generate valid access token
        validAccessToken = jwtTokenProvider.generateAccessToken(testUser);
    }

    @Test
    @DisplayName("GET /api/auth/me should return 401 without authentication")
    void getCurrentUser_WithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/me should return user data with valid token")
    void getCurrentUser_WithValidToken_ShouldReturnUserData() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .cookie(new Cookie("accessToken", validAccessToken))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("integration-test@smartcampus.edu"))
                .andExpect(jsonPath("$.name").value("Integration Test User"))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.provider").value("GOOGLE"));
    }

    @Test
    @DisplayName("GET /api/auth/me should return 401 with invalid token")
    void getCurrentUser_WithInvalidToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .cookie(new Cookie("accessToken", "invalid.token.here"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/refresh should return 401 without refresh token")
    void refreshToken_WithoutRefreshToken_ShouldReturn401() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Refresh token not found"));
    }

    @Test
    @DisplayName("DELETE /api/auth/logout should return success even without token")
    void logout_WithoutToken_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(delete("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    @DisplayName("DELETE /api/auth/logout should clear cookies")
    void logout_ShouldClearCookies() throws Exception {
        mockMvc.perform(delete("/api/auth/logout")
                        .cookie(new Cookie("accessToken", validAccessToken))
                        .cookie(new Cookie("refreshToken", "some-refresh-token"))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("accessToken", 0))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }
}
