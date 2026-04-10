package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestUserController {

    private final UserRepository userRepository;

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUser(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    java.util.HashMap<String, Object> details = new java.util.HashMap<>();
                    details.put("id", user.getId());
                    details.put("email", user.getEmail());
                    details.put("name", user.getName());
                    details.put("role", user.getRole());
                    details.put("password_hash", user.getPassword());
                    details.put("created_at", user.getCreatedAt());
                    return ResponseEntity.ok(details);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/user/{email}/role")
    public ResponseEntity<?> updateRole(@PathVariable String email, @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        return userRepository.findByEmail(email)
                .map(user -> {
                    user.setRole(newRole);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "message", "Role updated",
                            "email", user.getEmail(),
                            "role", user.getRole()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
