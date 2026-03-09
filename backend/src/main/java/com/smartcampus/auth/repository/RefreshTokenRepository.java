package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.RefreshToken;
import com.smartcampus.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for RefreshToken entity operations.
 * 
 * Provides methods for token lookup, revocation, and cleanup.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

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
     * Revoke all refresh tokens for a user.
     * Used for logout-all-devices functionality.
     * 
     * @param user the user whose tokens should be revoked
     * @return number of tokens revoked
     */
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user = :user AND rt.revoked = false")
    int revokeAllByUser(@Param("user") User user);

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
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.revoked = true OR rt.expiresAt < CURRENT_TIMESTAMP")
    int deleteExpiredAndRevokedTokens();
}
