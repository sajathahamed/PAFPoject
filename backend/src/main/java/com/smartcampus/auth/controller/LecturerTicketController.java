package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.CommentCreateRequest;
import com.smartcampus.auth.dto.CommentResponse;
import com.smartcampus.auth.dto.TicketCreateRequest;
import com.smartcampus.auth.dto.TicketResponse;
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
@RequestMapping("/api/lecturer/tickets")
@RequiredArgsConstructor
public class LecturerTicketController {

    private final TicketWorkflowService ticketWorkflowService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> listMine() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.listTicketsForReporter(user.getId()));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketCreateRequest body) {
        User user = authService.getCurrentUser();
        TicketResponse created = ticketWorkflowService.createTicket(user.getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateRequest body) {
        User user = authService.getCurrentUser();
        CommentResponse comment = ticketWorkflowService.addCommentAsStudent(id, user.getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }
}
