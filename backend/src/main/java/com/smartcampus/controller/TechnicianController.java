package com.smartcampus.controller;

import com.smartcampus.model.Ticket;
import com.smartcampus.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
public class TechnicianController {

    private final TechnicianService technicianService;

    @GetMapping("/tickets")
    public ResponseEntity<List<Ticket>> getTickets(
            @RequestParam(defaultValue = "ALL") String status) {

        String technicianId = getCurrentUserId();
        List<Ticket> tickets = technicianService.getTickets(technicianId, status);
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/tickets/{id}/status")
    public ResponseEntity<Ticket> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String technicianId = getCurrentUserId();
        Ticket updated = technicianService.updateTicketStatus(id, technicianId, body);
        return ResponseEntity.ok(updated);
    }

    private String getCurrentUserId() {
        return (String) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
