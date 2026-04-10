package com.smartcampus.auth.config;

import com.smartcampus.auth.entity.Resource;
import com.smartcampus.auth.entity.ResourceStatus;
import com.smartcampus.auth.entity.ResourceType;
import com.smartcampus.auth.entity.Role;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.ResourceRepository;
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
    private final ResourceRepository resourceRepository;
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
        } else {
            log.info("Database already contains data. Skipping user seeding.");
        }

        if (resourceRepository.count() == 0) {
            resourceRepository.save(Resource.builder()
                    .name("Innovation Lab A")
                    .type(ResourceType.LABROOM)
                    .capacity(24)
                    .location("Engineering Building, Room 101")
                    .status(ResourceStatus.ACTIVE)
                    .build());
            resourceRepository.save(Resource.builder()
                    .name("Seminar Hall B")
                    .type(ResourceType.LABROOM)
                    .capacity(60)
                    .location("Main Campus, Block C")
                    .status(ResourceStatus.ACTIVE)
                    .build());
            log.info("Seeded sample bookable resources.");
        }
    }
}
