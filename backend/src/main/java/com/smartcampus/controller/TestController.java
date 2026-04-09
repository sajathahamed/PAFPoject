package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
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
    private final TicketRepository ticketRepository;

    @Value("${technician.test.email}")
    private String technicianTestEmail;

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

    /**
     * Browser-friendly ticket check endpoint.
     *
     * Examples:
     *   GET /test/technician/tickets
     *   GET /test/technician/tickets?status=IN_PROGRESS
     *   GET /test/technician/tickets?status=RESOLVED
     *   GET /test/technician/tickets?email=easytech6727@gmail.com
     */
    @GetMapping("/technician/tickets")
    public ResponseEntity<?> technicianTickets(
        @RequestParam(defaultValue = "ALL") String status,
        @RequestParam(required = false) String email
    ) {
    String targetEmail = (email == null || email.isBlank())
        ? technicianTestEmail
        : email.trim();

    User technician = userRepository.findByEmailIgnoreCase(targetEmail)
        .orElse(null);

    if (technician == null) {
        return ResponseEntity.ok(Map.of(
            "status", "not_found",
            "message", "No user found for email: " + targetEmail,
            "tickets", List.of()
        ));
    }

    List<Ticket> tickets = "ALL".equalsIgnoreCase(status)
        ? ticketRepository.findByAssignedTechnicianId(technician.getId())
        : ticketRepository.findByAssignedTechnicianIdAndStatus(
            technician.getId(), status.toUpperCase());

    List<Map<String, Object>> payload = tickets.stream()
        .sorted(Comparator.comparing(Ticket::getUpdatedAt,
            Comparator.nullsLast(Comparator.naturalOrder())).reversed())
        .map(t -> Map.<String, Object>of(
            "id", t.getId() != null ? t.getId() : "",
            "title", t.getTitle() != null ? t.getTitle() : "",
            "category", t.getCategory() != null ? t.getCategory() : "",
            "priority", t.getPriority() != null ? t.getPriority() : "",
            "status", t.getStatus() != null ? t.getStatus() : "",
            "description", t.getDescription() != null ? t.getDescription() : "",
            "resolutionNote", t.getResolutionNote() != null ? t.getResolutionNote() : "",
            "createdAt", t.getCreatedAt() != null ? t.getCreatedAt().toString() : "",
            "updatedAt", t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : ""
        ))
        .toList();

    return ResponseEntity.ok(Map.of(
        "technicianEmail", technician.getEmail(),
        "technicianName", technician.getName() != null ? technician.getName() : "",
        "filter", status.toUpperCase(),
        "count", payload.size(),
        "tickets", payload
    ));
    }
}
