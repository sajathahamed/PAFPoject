package com.smartcampus.controller;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Public diagnostic endpoints — useful to verify MongoDB connectivity
 * and confirm seeded/migrated accounts exist.
 *
 * Open in browser (no auth required):
 *   GET http://localhost:8080/test/accounts   — list all users (no passwords)
 *   GET http://localhost:8080/test/db         — basic connectivity check
 */
@RestController
@RequestMapping("/test")
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;

    /** Confirms MongoDB is reachable and returns total user count. */
    @GetMapping("/db")
    public ResponseEntity<Map<String, Object>> dbCheck() {
        long count = userRepository.count();
        return ResponseEntity.ok(Map.of(
                "status",     "ok",
                "collection", "users",
                "totalUsers", count,
                "message",    count > 0
                        ? "MongoDB connected and data is present."
                        : "MongoDB connected but users collection is empty."
        ));
    }

    /**
     * Returns all users in the database with sensitive fields stripped.
     * Use this to confirm the seeded / migrated accounts exist.
     */
    @GetMapping("/accounts")
    public ResponseEntity<List<Map<String, Object>>> listAccounts() {
        List<User> users = userRepository.findAll();

        List<Map<String, Object>> safe = users.stream()
                .map(u -> Map.<String, Object>of(
                        "id",        u.getId()    != null ? u.getId()    : "",
                        "name",      u.getName()  != null ? u.getName()  : "",
                        "email",     u.getEmail() != null ? u.getEmail() : "",
                        "role",      u.getRole()  != null ? u.getRole()  : "",
                        "hasPassword", u.getPassword() != null && !u.getPassword().isBlank(),
                        "hasGoogleId", u.getGoogleId() != null && !u.getGoogleId().isBlank(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                ))
                .toList();

        return ResponseEntity.ok(safe);
    }
}
