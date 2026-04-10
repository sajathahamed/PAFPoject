package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                "id",         user.getId(),
                "name",       user.getName() != null ? user.getName() : "",
                "email",      user.getEmail(),
                "picture",    user.getPicture() != null ? user.getPicture() : "",
                "role",       user.getRole(),
                "phone",      user.getPhone() != null ? user.getPhone() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : ""
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optUser.get();
        return ResponseEntity.ok(Map.of(
                "id",         user.getId(),
                "name",       user.getName() != null ? user.getName() : "",
                "email",      user.getEmail(),
                "phone",      user.getPhone() != null ? user.getPhone() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : "",
                "role",       user.getRole()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body) {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optUser.get();
        if (body.containsKey("name")) user.setName(body.get("name"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        if (body.containsKey("department")) user.setDepartment(body.get("department"));

        user = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id",         user.getId(),
                "name",       user.getName() != null ? user.getName() : "",
                "email",      user.getEmail(),
                "phone",      user.getPhone() != null ? user.getPhone() : "",
                "department", user.getDepartment() != null ? user.getDepartment() : "",
                "role",       user.getRole()
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String userId = (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        Optional<User> optUser = userRepository.findById(userId);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        User user = optUser.get();

        if (user.getPassword() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password login not set. Use Google OAuth."));
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
