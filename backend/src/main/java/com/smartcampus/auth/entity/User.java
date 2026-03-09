package com.smartcampus.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA Entity representing a user in the Smart Campus system.
 * 
 * Users are created automatically upon first OAuth2 login.
 * Default role is USER; ADMIN can promote users to other roles.
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email"),
    @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    /**
     * OAuth2 provider name (e.g., "GOOGLE")
     */
    @Column(nullable = false, length = 50)
    private String provider;

    /**
     * Unique identifier from the OAuth2 provider (e.g., Google's 'sub' claim)
     */
    @Column(name = "provider_id", nullable = false, length = 255)
    private String providerId;

    /**
     * User's role determining access permissions.
     * Defaults to USER on first login.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Updates the last login timestamp to current time.
     */
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
