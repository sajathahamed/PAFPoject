package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.CommentCreateRequest;
import com.smartcampus.auth.dto.CommentResponse;
import com.smartcampus.auth.dto.TicketResponse;
import com.smartcampus.auth.dto.TicketStatusUpdateRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.service.AuthService;
import com.smartcampus.auth.service.TicketWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician/tickets")
@RequiredArgsConstructor
public class TechnicianTicketController {

    private final TicketWorkflowService ticketWorkflowService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> listAll() {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.listTicketsForTechnician());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateRequest body) {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.updateTicketStatus(id, body.getStatus()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateRequest body) {
        User user = authService.getCurrentUser();
        CommentResponse comment = ticketWorkflowService.addCommentAsTechnician(id, user.getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
}
