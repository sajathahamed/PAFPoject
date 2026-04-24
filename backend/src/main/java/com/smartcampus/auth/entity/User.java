package com.smartcampus.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * JPA Entity representing a user in the Smart Campus system.
 * 
 * Users are created automatically upon first OAuth2 login.
 * Default role is USER; ADMIN can promote users to other roles.
 */
@Document(collection = "users")
@CompoundIndexes({
    @CompoundIndex(name = "provider_idx", def = "{'provider': 1, 'providerId': 1}", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("email")
    private String email;

    @Field("name")
    private String name;

    @Field("profile_picture")
    private String profilePicture;

    @Field("password")
    private String password;

    /**
     * OAuth2 provider name (e.g., "GOOGLE", "LOCAL")
     */
    @Field("provider")
    private String provider;

    /**
     * Unique identifier from the OAuth2 provider (e.g., Google's 'sub' claim)
     */
    @Field("provider_id")
    private String providerId;

    /**
     * User's role determining access permissions.
     * Defaults to USER on first login.
     */
    @Field("role")
    @Builder.Default
    private Role role = Role.STUDENT;

    @Field("active")
    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("last_login_at")
    private LocalDateTime lastLoginAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    /**
     * Updates the last login timestamp to current time.
     */
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
