package com.smartcampus.service;

import com.smartcampus.model.Ticket;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TechnicianService {

    private final TicketRepository ticketRepository;

    public List<Ticket> getTickets(String technicianId, String status) {
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return ticketRepository.findByAssignedTechnicianId(technicianId);
        }
        return ticketRepository.findByAssignedTechnicianIdAndStatus(
                technicianId, status.toUpperCase());
    }

    public Ticket updateTicketStatus(String ticketId, String technicianId,
                                     Map<String, String> body) {
        Ticket ticket = ticketRepository
                .findByIdAndAssignedTechnicianId(ticketId, technicianId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Ticket not found or not assigned to you"));

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }

        // Only allow moving IN_PROGRESS → RESOLVED for technicians
        List<String> allowed = List.of("IN_PROGRESS", "RESOLVED");
        if (!allowed.contains(newStatus.toUpperCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Status must be IN_PROGRESS or RESOLVED");
        }

        ticket.setStatus(newStatus.toUpperCase());

        if ("RESOLVED".equalsIgnoreCase(newStatus)) {
            String note = body.get("resolutionNote");
            if (note != null && !note.isBlank()) {
                ticket.setResolutionNote(note.trim());
            }
        }

        ticket.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(ticket);
    }
}
