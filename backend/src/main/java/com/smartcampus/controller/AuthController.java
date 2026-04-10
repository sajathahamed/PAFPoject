package com.smartcampus.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client.id:}")
    private String googleClientId;

    @Value("${technician.test.email:}")
    private String technicianTestEmail;

    /**
     * Get the currently authenticated user's profile.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }

        String userId = (String) authentication.getPrincipal();
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(buildUserResponse(userOpt.get()));
    }

    // ── Google OAuth2 callback ──────────────────────────────────────────────
    @PostMapping("/google/callback")
    public ResponseEntity<?> googleCallback(@RequestBody Map<String, String> body, HttpServletResponse response) {
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

        addTokenCookie(response, "accessToken", jwt, 24 * 60 * 60);

        return ResponseEntity.ok(Map.of(
                "jwt", jwt,
                "user", buildUserResponse(user)
        ));
    }

    // ── Username / Password signup ─────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req, HttpServletResponse response) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }

        String role = resolveRoleForEmail(req.email(), null);

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(role)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        String jwt = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        addTokenCookie(response, "accessToken", jwt, 24 * 60 * 60);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "jwt", jwt,
                "user", buildUserResponse(user)
        ));
    }

    // ── Username / Password login ──────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        log.info("Login attempt for email: {}", req.email());
        Optional<User> optUser = userRepository.findByEmail(req.email());
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
        
        addTokenCookie(response, "accessToken", jwt, 24 * 60 * 60);

        return ResponseEntity.ok(Map.of(
                "jwt", jwt,
                "user", buildUserResponse(user)
        ));
    }

    @DeleteMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("accessToken", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private void addTokenCookie(HttpServletResponse response, String name, String value, int maxAge) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(maxAge);
        response.addCookie(cookie);
    }

    private User upsertGoogleUser(String googleId, String email, String name, String picture) {
        Optional<User> existing = userRepository.findByEmail(email);

        if (existing.isPresent()) {
            User user = existing.get();
            user.setGoogleId(googleId);
            if (name != null) user.setName(name);
            if (picture != null) user.setPicture(picture);
            return userRepository.save(user);
        }

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
        if (existingRole != null && !existingRole.isBlank()) {
            return existingRole;
        }
        if (email != null && email.equalsIgnoreCase(technicianTestEmail)) {
            return "TECHNICIAN";
        }
        // System admin check
        if (email != null && email.equalsIgnoreCase("admin@smartcampus.com")) {
            return "ADMIN";
        }
        return "STUDENT";
    }

    private Map<String, Object> buildUserResponse(User user) {
        return Map.of(
                "id",      user.getId() != null ? user.getId() : "",
                "name",    user.getName() != null ? user.getName() : "",
                "email",   user.getEmail() != null ? user.getEmail() : "",
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "role",    user.getRole() != null ? user.getRole() : "STUDENT"
        );
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
