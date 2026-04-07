package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AdminUserCreateRequest;
import com.smartcampus.auth.dto.RoleUpdateRequest;
import com.smartcampus.auth.dto.UserDTO;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for user management operations.
 * All endpoints require ADMIN role.
 * 
 * Endpoints:
 * - GET  /api/users        - List all users
 * - GET  /api/users/{id}   - Get user by ID
 * - POST /api/users        - Create new user (Admin)
 * - PUT  /api/users/{id}/role - Update user role
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get all users in the system.
     * Admin only.
     * 
     * @return List of all users with their roles
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.debug("Fetching all users");
        
        List<UserDTO> users = userService.getAllUsers().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(users);
    }

    /**
     * Get a specific user by ID.
     * Admin only.
     * 
     * @param id the user ID
     * @return UserDTO of the requested user
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        log.debug("Fetching user with id: {}", id);
        
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Update a user's role.
     * Admin only.
     * 
     * @param id the user ID to update
     * @param request the new role
     * @return Updated UserDTO
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody RoleUpdateRequest request) {
        
        log.info("Updating role for user {} to {}", id, request.getRole());
        
        User updatedUser = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
    }

    /**
     * Create a new user account with a specific role.
     * Admin only.
     * 
     * @param request the user details
     * @return the created user
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody AdminUserCreateRequest request) {
        log.info("Admin is creating a new user: {}", request.getEmail());
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(UserDTO.fromEntity(user));
    }
}
