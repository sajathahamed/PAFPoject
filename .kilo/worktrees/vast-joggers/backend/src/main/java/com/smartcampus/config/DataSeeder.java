package com.smartcampus.config;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            log.info("DataSeeder: collections already populated, skipping seed.");
            return;
        }

        log.info("DataSeeder: seeding initial data...");

        // ── Create 4 users ──────────────────────────────────────────────────
        User student = userRepository.save(User.builder()
                .googleId("google-fake-id-student-001")
                .name("Amal Perera")
                .email("amal.perera@sliit.lk")
                .picture("")
                .role("STUDENT")
                .createdAt(LocalDateTime.now().minusDays(30))
                .build());

        User lecturer = userRepository.save(User.builder()
                .googleId("google-fake-id-lecturer-002")
                .name("Dr. Niluka Fernando")
                .email("niluka.fernando@sliit.lk")
                .picture("")
                .role("LECTURER")
                .createdAt(LocalDateTime.now().minusDays(60))
                .build());

        User technician = userRepository.save(User.builder()
                .googleId("google-fake-id-tech-003")
                .name("Kasun Rajapaksa")
                .email("kasun.rajapaksa@sliit.lk")
                .picture("")
                .role("TECHNICIAN")
                .createdAt(LocalDateTime.now().minusDays(90))
                .build());

        User admin = userRepository.save(User.builder()
                .googleId("google-fake-id-admin-004")
                .name("Samanthi Wickrama")
                .email("samanthi.wickrama@sliit.lk")
                .picture("")
                .role("ADMIN")
                .createdAt(LocalDateTime.now().minusDays(120))
                .build());

        log.info("DataSeeder: created users — student={}, lecturer={}, technician={}, admin={}",
                student.getId(), lecturer.getId(), technician.getId(), admin.getId());

        // ── Create 6 tickets assigned to the technician ─────────────────────
        // 3 IN_PROGRESS
        List<Ticket> inProgressTickets = List.of(
                Ticket.builder()
                        .title("WiFi Connectivity Issue in Block A")
                        .description("Students in Block A, Level 3 are unable to connect to the campus WiFi. " +
                                "The issue started after the recent router firmware update. Multiple students affected.")
                        .category("IT Infrastructure")
                        .priority("HIGH")
                        .status("IN_PROGRESS")
                        .assignedTechnicianId(technician.getId())
                        .createdBy(student.getId())
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .updatedAt(LocalDateTime.now().minusDays(2))
                        .build(),

                Ticket.builder()
                        .title("Projector Not Working in Room B204")
                        .description("The ceiling-mounted projector in lecture room B204 shows a blank screen. " +
                                "The HDMI input appears to be unresponsive. Lecturers are using room B202 as a workaround.")
                        .category("AV Equipment")
                        .priority("MEDIUM")
                        .status("IN_PROGRESS")
                        .assignedTechnicianId(technician.getId())
                        .createdBy(lecturer.getId())
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .updatedAt(LocalDateTime.now().minusDays(4))
                        .build(),

                Ticket.builder()
                        .title("Lab Computer #14 Fails to Boot")
                        .description("Computer workstation #14 in the Computing Lab (Room C101) does not boot. " +
                                "POST screen shows a disk error. Other computers in the lab are unaffected.")
                        .category("Hardware")
                        .priority("HIGH")
                        .status("IN_PROGRESS")
                        .assignedTechnicianId(technician.getId())
                        .createdBy(student.getId())
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .updatedAt(LocalDateTime.now().minusDays(1))
                        .build()
        );

        // 3 RESOLVED
        List<Ticket> resolvedTickets = List.of(
                Ticket.builder()
                        .title("Printer Jam in Faculty Office")
                        .description("The laser printer on the second floor faculty office is repeatedly jamming " +
                                "after printing 2-3 pages. Paper is confirmed to be the correct size.")
                        .category("Hardware")
                        .priority("LOW")
                        .status("RESOLVED")
                        .assignedTechnicianId(technician.getId())
                        .createdBy(admin.getId())
                        .resolutionNote("Found a torn piece of paper stuck in the rear feed roller. " +
                                "Cleared the jam and ran a test print of 20 pages without issues. " +
                                "Advised staff to use the drawer tray instead of the manual feed slot.")
                        .createdAt(LocalDateTime.now().minusDays(10))
                        .updatedAt(LocalDateTime.now().minusDays(8))
                        .build(),

                Ticket.builder()
                        .title("Software License Expired — MATLAB")
                        .description("MATLAB license on the engineering lab machines expired. " +
                                "Students cannot run simulations for their assignments due this Friday.")
                        .category("Software")
                        .priority("HIGH")
                        .status("RESOLVED")
                        .assignedTechnicianId(technician.getId())
                        .createdBy(lecturer.getId())
                        .resolutionNote("Renewed the campus MATLAB license via the MathWorks portal. " +
                                "Deployed the updated license file to all 32 machines in the lab using the " +
                                "centralized license server. All machines verified working.")
                        .createdAt(LocalDateTime.now().minusDays(14))
                        .updatedAt(LocalDateTime.now().minusDays(12))
                        .build(),

                Ticket.builder()
                        .title("Air Conditioning Unit Malfunction — Server Room")
                        .description("The server room AC unit is not cooling. Room temperature has risen " +
                                "to 28°C. UPS alarm is sounding. Immediate attention required to prevent hardware damage.")
                        .category("Facilities")
                        .priority("HIGH")
                        .status("RESOLVED")
                        .assignedTechnicianId(technician.getId())
                        .createdBy(admin.getId())
                        .resolutionNote("Identified a refrigerant leak in the secondary AC unit. " +
                                "Switched primary unit to full-load mode as a temporary fix (room cooled to 21°C within 30 min). " +
                                "Facilities vendor contacted for refrigerant recharge — scheduled for next Tuesday.")
                        .createdAt(LocalDateTime.now().minusDays(20))
                        .updatedAt(LocalDateTime.now().minusDays(19))
                        .build()
        );

        ticketRepository.saveAll(inProgressTickets);
        ticketRepository.saveAll(resolvedTickets);

        log.info("DataSeeder: seeded 3 IN_PROGRESS + 3 RESOLVED tickets for technician {}",
                technician.getId());
    }
}
