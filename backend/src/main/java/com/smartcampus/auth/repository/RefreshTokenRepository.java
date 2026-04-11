package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for RefreshToken entity operations.
 * 
 * Provides methods for token lookup, revocation, and cleanup.
 */
@Repository
public interface RefreshTokenRepository extends MongoRepository<RefreshToken, String> {

    /**
     * Find a refresh token by its token value.
     * 
     * @param token the token string to search for
     * @return Optional containing the RefreshToken if found
     */
    Optional<RefreshToken> findByToken(String token);

    /**
     * Find all non-revoked refresh tokens for a user.
     * 
     * @param user the user to find tokens for
     * @return list of active refresh tokens
     */
    List<RefreshToken> findByUserAndRevokedFalse(User user);

    /**
     * Find all refresh tokens for a user (including revoked).
     * 
     * @param user the user to find tokens for
     * @return list of all refresh tokens
     */
    List<RefreshToken> findByUser(User user);

    /**
     * Unused since MongoDB doesn't do direct update queries easily on repos.
     * Use a service to delete or find-and-modify.
     * Keeping signature if needed.
     */
    void deleteByUserAndRevokedFalse(User user);

    /**
     * Delete all refresh tokens for a user.
     * 
     * @param user the user whose tokens should be deleted
     */
    void deleteByUser(User user);

    /**
     * Delete all expired or revoked tokens (cleanup job).
     * 
     * @return number of tokens deleted
     */
    void deleteByRevokedTrueOrExpiresAtBefore(java.time.LocalDateTime date);
}
