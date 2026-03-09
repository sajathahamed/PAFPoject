package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service handling user management operations.
 * 
 * Provides admin functionality for:
 * - Listing all users
 * - Updating user roles
 * - User lookup
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get all users in the system.
     * Admin-only operation.
     * 
     * @return list of all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get a user by their ID.
     * 
     * @param id the user ID
     * @return the user entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    /**
     * Update a user's role.
     * Admin-only operation.
     * 
     * @param userId the user ID to update
     * @param newRole the new role to assign
     * @return the updated user
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional
    public User updateUserRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Role oldRole = user.getRole();
        user.setRole(newRole);
        User updatedUser = userRepository.save(user);

        log.info("User role updated: {} from {} to {}", user.getEmail(), oldRole, newRole);

        return updatedUser;
    }

    /**
     * Find a user by email.
     * 
     * @param email the email to search for
     * @return the user entity
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    /**
     * Count total users in the system.
     * 
     * @return total user count
     */
    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }
}
