package com.smartcampus.config;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketRepository;
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
import java.util.List;
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
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        Optional<User> existing = userRepository.findByEmail(techEmail);

        User technicianUser;

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
                technicianUser = userRepository.save(user);
                log.info("EnsureTestAccounts: updated technician account for {}", techEmail);
            } else {
                technicianUser = user;
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

            technicianUser = userRepository.save(techUser);
            log.info("EnsureTestAccounts: created technician account for {}", techEmail);
        }

        seedTechnicianTicketsIfMissing(technicianUser);
    }

    private void seedTechnicianTicketsIfMissing(User technicianUser) {
        List<Ticket> existingTickets = ticketRepository.findByAssignedTechnicianId(technicianUser.getId());
        if (!existingTickets.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        List<Ticket> sampleTickets = List.of(
                Ticket.builder()
                        .title("Internet outage in Computing Lab B1")
                        .description("Internet disconnects every 10 minutes for all student PCs in Lab B1.")
                        .category("Network")
                        .priority("HIGH")
                        .status("IN_PROGRESS")
                        .assignedTechnicianId(technicianUser.getId())
                        .createdBy(technicianUser.getId())
                        .createdAt(now.minusDays(2))
                        .updatedAt(now.minusDays(1))
                        .build(),
                Ticket.builder()
                        .title("Projector color distortion - Hall A")
                        .description("Projector output has a strong green tint during lectures in Hall A.")
                        .category("AV Equipment")
                        .priority("MEDIUM")
                        .status("IN_PROGRESS")
                        .assignedTechnicianId(technicianUser.getId())
                        .createdBy(technicianUser.getId())
                        .createdAt(now.minusDays(1))
                        .updatedAt(now.minusHours(10))
                        .build(),
                Ticket.builder()
                        .title("Faculty office printer queue stuck")
                        .description("Printer jobs remain in queue and do not print until service restart.")
                        .category("Hardware")
                        .priority("LOW")
                        .status("RESOLVED")
                        .assignedTechnicianId(technicianUser.getId())
                        .createdBy(technicianUser.getId())
                        .resolutionNote("Restarted spooler service and cleared stale queue jobs. Test print successful.")
                        .createdAt(now.minusDays(4))
                        .updatedAt(now.minusDays(3))
                        .build()
        );

        ticketRepository.saveAll(sampleTickets);
        log.info("EnsureTestAccounts: seeded {} sample tickets for {}", sampleTickets.size(), techEmail);
    }
}
