package com.smartcampus.config;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.info("DataSeeder: checking and seeding initial data...");

        String commonPassword = "admin123";

        // ── Ensure Admin User exists and is up-to-date ───────────────────
        ensureUser("admin@smartcampus.com", "System Admin", "ADMIN", commonPassword);

        // ── Ensure other test users exist ────────────────────────────────
        ensureUser("amal.perera@sliit.lk", "Amal Perera", "STUDENT", commonPassword);
        ensureUser("niluka.fernando@sliit.lk", "Dr. Niluka Fernando", "LECTURER", commonPassword);
        ensureUser("kasun.rajapaksa@sliit.lk", "Kasun Rajapaksa", "TECHNICIAN", commonPassword);

        // ── Seed sample tickets if none exist ───────────────────────────
        if (ticketRepository.count() == 0) {
            Optional<User> student = userRepository.findByEmail("amal.perera@sliit.lk");
            Optional<User> technician = userRepository.findByEmail("kasun.rajapaksa@sliit.lk");
            
            if (student.isPresent() && technician.isPresent()) {
                List<Ticket> sampleTickets = List.of(
                        Ticket.builder()
                                .title("WiFi Connectivity Issue in Block A")
                                .description("Students in Block A, Level 3 are unable to connect to the campus WiFi.")
                                .category("IT Infrastructure")
                                .priority("HIGH")
                                .status("IN_PROGRESS")
                                .assignedTechnicianId(technician.get().getId())
                                .createdBy(student.get().getId())
                                .createdAt(LocalDateTime.now().minusDays(3))
                                .build()
                );
                ticketRepository.saveAll(sampleTickets);
                log.info("DataSeeder: seeded sample tickets.");
            }
        }
    }

    private void ensureUser(String email, String name, String role, String plainPassword) {
        Optional<User> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;
            if (!role.equals(user.getRole())) {
                user.setRole(role);
                changed = true;
            }
            if (user.getPassword() == null || !passwordEncoder.matches(plainPassword, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(plainPassword));
                changed = true;
            }
            if (user.getName() == null || user.getName().isBlank()) {
                user.setName(name);
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
                log.info("DataSeeder: updated user {}", email);
            }
        } else {
            User newUser = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(plainPassword))
                    .role(role)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(newUser);
            log.info("DataSeeder: created user {}", email);
        }
    }
}
