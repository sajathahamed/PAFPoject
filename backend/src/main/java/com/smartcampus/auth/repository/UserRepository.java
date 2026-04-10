package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity operations.
 * 
 * Provides methods for finding users by email, OAuth provider ID,
 * and standard CRUD operations inherited from JpaRepository.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find a user by their email address.
     * 
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Find a user by their OAuth provider and provider-specific ID.
     * Used to match returning OAuth users.
     * 
     * @param provider the OAuth provider name (e.g., "GOOGLE")
     * @param providerId the unique ID from the OAuth provider
     * @return Optional containing the user if found
     */
    Optional<User> findByProviderAndProviderId(String provider, String providerId);

    /**
     * Check if a user exists with the given email.
     * 
     * @param email the email to check
     * @return true if a user with this email exists
     */
    boolean existsByEmail(String email);

    /**
     * Case-insensitive substring match on display name (admin booking filters).
     */
    List<User> findByNameContainingIgnoreCase(String namePart);

    /**
     * Case-insensitive substring match on email (admin booking filters).
     */
    List<User> findByEmailContainingIgnoreCase(String emailPart);
}
