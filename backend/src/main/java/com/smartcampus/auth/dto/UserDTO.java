package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for User responses.
 * 
 * Excludes sensitive information like provider ID.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String email;
    private String name;
    private String profilePicture;
    private String provider;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    /**
     * Create a UserDTO from a User entity.
     * 
     * @param user the user entity
     * @return the DTO representation
     */
    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .provider(user.getProvider())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
