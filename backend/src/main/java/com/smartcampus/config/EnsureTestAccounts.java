package com.smartcampus.config;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Runs on every startup (after DataSeeder) to ensure the fixed technician
 * test account exists with the correct credentials.
 * Credentials are read from application-local.properties — never hardcoded.
 */
@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class EnsureTestAccounts implements ApplicationRunner {

    @Value("${technician.test.email}")
    private String techEmail;

    @Value("${technician.test.name}")
    private String techName;

    @Value("${technician.test.password}")
    private String techPassword;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        Optional<User> existing = userRepository.findByEmail(techEmail);

        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;

            if (!"TECHNICIAN".equals(user.getRole())) {
                user.setRole("TECHNICIAN");
                changed = true;
            }
            if (user.getPassword() == null ||
                    !passwordEncoder.matches(techPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(techPassword));
                changed = true;
            }
            if (user.getName() == null || user.getName().isBlank()) {
                user.setName(techName);
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
                log.info("EnsureTestAccounts: updated technician account for {}", techEmail);
            } else {
                log.info("EnsureTestAccounts: technician account already up-to-date for {}", techEmail);
            }
        } else {
            User techUser = User.builder()
                    .name(techName)
                    .email(techEmail)
                    .password(passwordEncoder.encode(techPassword))
                    .role("TECHNICIAN")
                    .createdAt(LocalDateTime.now())
                    .build();

            userRepository.save(techUser);
            log.info("EnsureTestAccounts: created technician account for {}", techEmail);
        }
    }
}
