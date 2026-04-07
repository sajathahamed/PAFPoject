package com.smartcampus.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * JPA Entity representing a refresh token for JWT authentication.
 * 
 * Refresh tokens are stored in the database to enable:
 * - Token revocation on logout
 * - Multiple device session management
 * - Token rotation for security
 */
@Document(collection = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    private String id;

    /**
     * The refresh token value (UUID string).
     * Used to obtain new access tokens.
     */
    @Indexed(unique = true)
    @Field("token")
    private String token;

    /**
     * User associated with this refresh token.
     */
    @DBRef
    @Indexed
    @Field("user")
    private User user;

    /**
     * Expiration timestamp for this token.
     */
    @Field("expires_at")
    private LocalDateTime expiresAt;

    /**
     * Flag indicating if this token has been revoked.
     * Revocation happens on logout or token rotation.
     */
    @Field("revoked")
    @Builder.Default
    private Boolean revoked = false;

    @CreatedDate
    @Field("created_at")
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
