package com.smartcampus.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${technician.test.email}")
    private String technicianTestEmail;

    // ── Google OAuth2 callback ──────────────────────────────────────────────
    @PostMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestBody Map<String, String> body) {
        String idTokenString = body.get("idToken");
        if (idTokenString == null || idTokenString.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "idToken is required"));
        }

        GoogleIdToken.Payload payload;
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid Google ID token"));
            }
            payload = idToken.getPayload();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Token verification failed"));
        }

        String googleId = payload.getSubject();
        String email    = payload.getEmail();
        String name     = (String) payload.get("name");
        String picture  = (String) payload.get("picture");

        User user = upsertGoogleUser(googleId, email, name, picture);
        String jwt = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "jwt", jwt,
                "user", buildUserResponse(user)
        ));
    }

    // ── Username / Password signup ─────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        String email = normalizeEmail(req.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }

        String role = resolveRoleForEmail(email, null);

        User user = User.builder()
                .name(req.name())
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        String jwt = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "jwt", jwt,
                "user", buildUserResponse(user)
        ));
    }

    // ── Username / Password login ──────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String email = normalizeEmail(req.email());
        Optional<User> optUser = userRepository.findByEmailIgnoreCase(email);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        User user = optUser.get();
        if (user.getPassword() == null ||
                !passwordEncoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        String jwt = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok(Map.of(
                "jwt", jwt,
                "user", buildUserResponse(user)
        ));
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private User upsertGoogleUser(String googleId, String email, String name, String picture) {
        email = normalizeEmail(email);
        // Look up by email first (handles merging if they signed up with password before)
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);

        if (existing.isPresent()) {
            User user = existing.get();
            // Update Google-specific fields and keep existing role
            user.setGoogleId(googleId);
            user.setEmail(email);
            if (name != null) user.setName(name);
            if (picture != null) user.setPicture(picture);
            return userRepository.save(user);
        }

        // New user — determine role
        String role = resolveRoleForEmail(email, null);

        User newUser = User.builder()
                .googleId(googleId)
                .email(email)
                .name(name != null ? name : email)
                .picture(picture)
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(newUser);
    }

    private String resolveRoleForEmail(String email, String existingRole) {
        // Keep existing role if already set
        if (existingRole != null && !existingRole.isBlank()) {
            return existingRole;
        }
        // Dev/test override: grant TECHNICIAN to the configured test email
        if (email != null && email.equalsIgnoreCase(technicianTestEmail)) {
            return "TECHNICIAN";
        }
        // Default role for all new users
        return "STUDENT";
    }

    private Map<String, Object> buildUserResponse(User user) {
        return Map.of(
                "id",      user.getId(),
                "name",    user.getName() != null ? user.getName() : "",
                "email",   user.getEmail(),
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "role",    user.getRole()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    // ── Request records ────────────────────────────────────────────────────

    public record SignupRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}
}
