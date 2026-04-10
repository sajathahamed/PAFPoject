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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Technician Ticket Controller - Full CRUD operations for ticket management
 * 
 * API Endpoints:
 * - GET /api/technician/tickets - List all tickets
 * - GET /api/technician/tickets/{id} - Get single ticket details
 * - PUT /api/technician/tickets/{id}/status - Update ticket status
 * - PUT /api/technician/tickets/{id}/assign - Assign ticket to current technician
 * - POST /api/technician/tickets/{id}/comments - Add comment
 * - GET /api/technician/tickets/{id}/comments - Get comments for ticket
 * - POST /api/technician/tickets/{id}/images - Add images to ticket
 * - DELETE /api/technician/tickets/{id}/images/{index} - Delete image from ticket
 */
@RestController
@RequestMapping("/api/technician/tickets")
@RequiredArgsConstructor
public class TechnicianTicketController {

    private final TicketWorkflowService ticketWorkflowService;
    private final AuthService authService;

    /**
     * List all tickets for technician view
     */
    @GetMapping
    public ResponseEntity<List<TicketResponse>> listAll() {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.listTicketsForTechnician());
    }

    /**
     * Get single ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getById(@PathVariable String id) {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.getTicketById(id));
    }

    /**
     * Update ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketStatusUpdateRequest body) {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.updateTicketStatus(id, body.getStatus()));
    }

    /**
     * Assign ticket to current technician
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignToSelf(@PathVariable String id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.assignTicket(id, user.getId()));
    }

    /**
     * Add comment to a ticket
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateRequest body) {
        User user = authService.getCurrentUser();
        CommentResponse comment = ticketWorkflowService.addCommentAsTechnician(id, user.getId(), body);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    /**
     * Get all comments for a ticket
     */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable String id) {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.getCommentsForTicket(id));
    }

    /**
     * Add images to a ticket (multipart file upload)
     */
    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> addImages(
            @PathVariable String id,
            @RequestParam("images") List<MultipartFile> images) {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.addImagesToTicket(id, images));
    }

    /**
     * Delete an image from a ticket by index
     */
    @DeleteMapping("/{id}/images/{imageIndex}")
    public ResponseEntity<TicketResponse> deleteImage(
            @PathVariable String id,
            @PathVariable int imageIndex) {
        authService.getCurrentUser();
        return ResponseEntity.ok(ticketWorkflowService.deleteImageFromTicket(id, imageIndex));
    }
}
