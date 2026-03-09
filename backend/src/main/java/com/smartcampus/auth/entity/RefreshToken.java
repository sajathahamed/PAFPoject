package com.smartcampus.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity representing a refresh token for JWT authentication.
 * 
 * Refresh tokens are stored in the database to enable:
 * - Token revocation on logout
 * - Multiple device session management
 * - Token rotation for security
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
    @Index(name = "idx_refresh_token_token", columnList = "token"),
    @Index(name = "idx_refresh_token_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The refresh token value (UUID string).
     * Used to obtain new access tokens.
     */
    @Column(nullable = false, unique = true, length = 255)
    private String token;

    /**
     * User associated with this refresh token.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Expiration timestamp for this token.
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Flag indicating if this token has been revoked.
     * Revocation happens on logout or token rotation.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean revoked = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Checks if this refresh token is valid (not expired and not revoked).
     * 
     * @return true if the token can be used, false otherwise
     */
    public boolean isValid() {
        return !revoked && LocalDateTime.now().isBefore(expiresAt);
    }

    /**
     * Revokes this refresh token.
     */
    public void revoke() {
        this.revoked = true;
    }
}
