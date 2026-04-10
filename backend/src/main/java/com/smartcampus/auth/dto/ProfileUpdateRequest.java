package com.smartcampus.auth.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    private String name;

    private String email;

    private String picture;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String oldPassword;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;
}
