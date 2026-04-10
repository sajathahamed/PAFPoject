package com.smartcampus.auth.config;

import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeder to initialize the database with default data on startup.
 * Creates an initial admin user if the database is empty.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Database is empty. Seeding initial data...");

            // Create default admin
            User admin = User.builder()
                    .email("admin@smartcampus.com")
                    .name("System Admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .provider("LOCAL")
                    .providerId("admin@smartcampus.com")
                    .build();

            userRepository.save(admin);
            log.info("Default admin user created: admin@smartcampus.com / admin123");
            
            // Note: Other collections (Resources, Bookings) work the same way.
            // They will appear as soon as the first document is saved in them.
        } else {
            log.info("Database already contains data. Skipping seeding.");
        }
    }
}
