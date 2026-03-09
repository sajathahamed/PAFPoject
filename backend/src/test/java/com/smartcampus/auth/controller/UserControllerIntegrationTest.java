package com.smartcampus.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.auth.dto.RoleUpdateRequest;
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
 * Integration tests for UserController.
 * 
 * Tests the /api/users/* endpoints with role-based access control.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminUser;
    private User regularUser;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        // Create admin user
        adminUser = User.builder()
                .email("admin@smartcampus.edu")
                .name("Admin User")
                .provider("GOOGLE")
                .providerId("google-admin-123")
                .role(Role.ADMIN)
                .lastLoginAt(LocalDateTime.now())
                .build();
        adminUser = userRepository.save(adminUser);
        adminToken = jwtTokenProvider.generateAccessToken(adminUser);

        // Create regular user
        regularUser = User.builder()
                .email("user@smartcampus.edu")
                .name("Regular User")
                .provider("GOOGLE")
                .providerId("google-user-456")
                .role(Role.USER)
                .lastLoginAt(LocalDateTime.now())
                .build();
        regularUser = userRepository.save(regularUser);
        userToken = jwtTokenProvider.generateAccessToken(regularUser);
    }

    @Test
    @DisplayName("GET /api/users should return 401 without authentication")
    void getAllUsers_WithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/users should return 403 for non-admin user")
    void getAllUsers_AsNonAdmin_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/users")
                        .cookie(new Cookie("accessToken", userToken))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/users should return users list for admin")
    void getAllUsers_AsAdmin_ShouldReturnUsersList() throws Exception {
        mockMvc.perform(get("/api/users")
                        .cookie(new Cookie("accessToken", adminToken))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role should return 403 for non-admin user")
    void updateRole_AsNonAdmin_ShouldReturn403() throws Exception {
        RoleUpdateRequest request = new RoleUpdateRequest(Role.TECHNICIAN);

        mockMvc.perform(put("/api/users/" + regularUser.getId() + "/role")
                        .cookie(new Cookie("accessToken", userToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role should update role for admin")
    void updateRole_AsAdmin_ShouldUpdateRole() throws Exception {
        RoleUpdateRequest request = new RoleUpdateRequest(Role.TECHNICIAN);

        mockMvc.perform(put("/api/users/" + regularUser.getId() + "/role")
                        .cookie(new Cookie("accessToken", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(regularUser.getId()))
                .andExpect(jsonPath("$.role").value("TECHNICIAN"));
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role should return 404 for non-existent user")
    void updateRole_ForNonExistentUser_ShouldReturn404() throws Exception {
        RoleUpdateRequest request = new RoleUpdateRequest(Role.ADMIN);

        mockMvc.perform(put("/api/users/99999/role")
                        .cookie(new Cookie("accessToken", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role should return 400 for invalid role")
    void updateRole_WithInvalidRole_ShouldReturn400() throws Exception {
        mockMvc.perform(put("/api/users/" + regularUser.getId() + "/role")
                        .cookie(new Cookie("accessToken", adminToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\": \"INVALID_ROLE\"}"))
                .andExpect(status().isBadRequest());
    }
}
