package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optUser.get();
        return ResponseEntity.ok(Map.of(
                "id",      user.getId(),
                "name",    user.getName() != null ? user.getName() : "",
                "email",   user.getEmail(),
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "role",    user.getRole()
        ));
    }
}
