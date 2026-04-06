package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String googleId;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String picture;

    // Hashed password — null for pure Google-OAuth users
    private String password;

    // STUDENT | LECTURER | TECHNICIAN | ADMIN
    private String role;

    private LocalDateTime createdAt;
}
