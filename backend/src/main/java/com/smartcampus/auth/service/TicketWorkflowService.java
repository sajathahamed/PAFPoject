package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.CommentCreateRequest;
import com.smartcampus.auth.dto.CommentResponse;
import com.smartcampus.auth.dto.TicketCreateRequest;
import com.smartcampus.auth.dto.TicketResponse;
import com.smartcampus.auth.entity.Comment;
import com.smartcampus.auth.entity.NotificationType;
import com.smartcampus.auth.entity.RelatedEntityType;
import com.smartcampus.auth.entity.Ticket;
import com.smartcampus.auth.entity.TicketPriority;
import com.smartcampus.auth.entity.TicketStatus;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.CommentRepository;
import com.smartcampus.auth.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Ticket Workflow Service - Handles all ticket-related business logic
 * 
 * Features:
 * - Ticket creation and management
 * - Status updates with notifications
 * - Comment system for ticket discussions
 * - Image upload and management (Base64 storage)
 * - Technician assignment
 */
@Service
@RequiredArgsConstructor
public class TicketWorkflowService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    /**
     * Create a new support ticket
     */
    public TicketResponse createTicket(String reporterId, TicketCreateRequest request) {
        TicketPriority priority = request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM;
        Ticket ticket = Ticket.builder()
                .reporterId(reporterId)
                .category(request.getCategory1())
                .description(request.getDescription().trim())
                .priority(priority)
                .status(TicketStatus.OPEN)
                .images(new ArrayList<>())
                .build();
        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    /**
     * Get a single ticket by ID
     */
    public TicketResponse getTicketById(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return TicketResponse.fromEntity(ticket);
    }

    /**
     * List tickets for a specific reporter (student)
     */
    public List<TicketResponse> listTicketsForReporter(String reporterId) {
        return ticketRepository.findByReporterId(reporterId).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * List all tickets for technician view
     */
    public List<TicketResponse> listTicketsForTechnician() {
        return ticketRepository.findAll().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update ticket status and notify the reporter
     */
    public TicketResponse updateTicketStatus(String ticketId, TicketStatus newStatus, String actorUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        TicketStatus previous = ticket.getStatus();
        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        String reporterId = saved.getReporterId();
        if (reporterId != null && previous != newStatus) {
            String summary = summarizeDescription(saved.getDescription());
            notificationService.createNotification(
                    reporterId,
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket status updated",
                    String.format("Your ticket \"%s\" changed from %s to %s.", summary, previous, newStatus),
                    saved.getId(),
                    RelatedEntityType.TICKET);
        }

        if (actorUserId != null && !actorUserId.isBlank() && previous != newStatus) {
            String summary = summarizeDescription(saved.getDescription());
            notificationService.createNotification(
                    actorUserId,
                    NotificationType.TICKET_STATUS_CHANGED,
                    "You updated a ticket",
                    String.format("You changed \"%s\" from %s to %s.", summary, previous, newStatus),
                    saved.getId(),
                    RelatedEntityType.TICKET);
        }
        return TicketResponse.fromEntity(saved);
    }

    /**
     * Assign a ticket to a technician
     */
    public TicketResponse assignTicket(String ticketId, String technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        ticket.setAssignedId(technicianId);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        Ticket saved = ticketRepository.save(ticket);
        
        // Notify reporter about assignment
        if (saved.getReporterId() != null) {
            String summary = summarizeDescription(saved.getDescription());
            notificationService.createNotification(
                    saved.getReporterId(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Technician assigned to your ticket",
                    String.format("A technician has been assigned to your ticket: \"%s\"", summary),
                    saved.getId(),
                    RelatedEntityType.TICKET);
        }

        if (technicianId != null && !technicianId.isBlank()) {
            String summary = summarizeDescription(saved.getDescription());
            notificationService.createNotification(
                    technicianId,
                    NotificationType.TICKET_ASSIGNED,
                    "Ticket assigned to you",
                    String.format("You assigned yourself to ticket: \"%s\"", summary),
                    saved.getId(),
                    RelatedEntityType.TICKET);
        }
        return TicketResponse.fromEntity(saved);
    }

    /**
     * Add images to a ticket (stored as Base64 data URLs)
     */
    public TicketResponse addImagesToTicket(String ticketId, List<MultipartFile> images, String actorUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        
        List<String> existingImages = ticket.getImages();
        if (existingImages == null) {
            existingImages = new ArrayList<>();
        }
        
        for (MultipartFile image : images) {
            try {
                if (!image.isEmpty()) {
                    String contentType = image.getContentType();
                    if (contentType == null) {
                        contentType = "image/png";
                    }
                    byte[] bytes = image.getBytes();
                    String base64 = Base64.getEncoder().encodeToString(bytes);
                    String dataUrl = "data:" + contentType + ";base64," + base64;
                    existingImages.add(dataUrl);
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to process image: " + image.getOriginalFilename(), e);
            }
        }
        
        ticket.setImages(existingImages);
        Ticket saved = ticketRepository.save(ticket);

        if (actorUserId != null && !actorUserId.isBlank() && images != null && !images.isEmpty()) {
            String summary = summarizeDescription(saved.getDescription());
            notificationService.createNotification(
                    actorUserId,
                    NotificationType.SYSTEM_ALERT,
                    "Images added to ticket",
                    String.format("You added %d image(s) to \"%s\".", images.size(), summary),
                    saved.getId(),
                    RelatedEntityType.TICKET);
        }
        return TicketResponse.fromEntity(saved);
    }

    /**
     * Delete an image from a ticket by index
     */
    public TicketResponse deleteImageFromTicket(String ticketId, int imageIndex, String actorUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        
        List<String> images = ticket.getImages();
        if (images == null || imageIndex < 0 || imageIndex >= images.size()) {
            throw new IllegalArgumentException("Invalid image index: " + imageIndex);
        }
        
        images.remove(imageIndex);
        ticket.setImages(images);
        Ticket saved = ticketRepository.save(ticket);

        if (actorUserId != null && !actorUserId.isBlank()) {
            String summary = summarizeDescription(saved.getDescription());
            notificationService.createNotification(
                    actorUserId,
                    NotificationType.SYSTEM_ALERT,
                    "Image removed from ticket",
                    String.format("You removed an image from \"%s\".", summary),
                    saved.getId(),
                    RelatedEntityType.TICKET);
        }
        return TicketResponse.fromEntity(saved);
    }

    /**
     * Get all comments for a ticket
     */
    public List<CommentResponse> getCommentsForTicket(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                .stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Add comment as a student (only on own tickets)
     */
    public CommentResponse addCommentAsStudent(String ticketId, String userId, CommentCreateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (!userId.equals(ticket.getReporterId())) {
            throw new AccessDeniedException("You can only comment on your own tickets");
        }
        return addCommentInternal(ticket, userId, request.getContent().trim());
    }

    /**
     * Add comment as a technician (any ticket)
     */
    public CommentResponse addCommentAsTechnician(String ticketId, String userId, CommentCreateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        CommentResponse response = addCommentInternal(ticket, userId, request.getContent().trim());
        String summary = summarizeDescription(ticket.getDescription());
        notificationService.createNotification(
            userId,
            NotificationType.NEW_COMMENT,
            "Comment posted",
            String.format("You commented on \"%s\".", summary),
            ticket.getId(),
            RelatedEntityType.TICKET);
        return response;
    }

    /**
     * Internal method to add comment and send notifications
     */
    private CommentResponse addCommentInternal(Ticket ticket, String authorId, String content) {
        List<Comment> prior = commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
        Set<String> notifyUserIds = new LinkedHashSet<>();
        if (ticket.getReporterId() != null) {
            notifyUserIds.add(ticket.getReporterId());
        }
        for (Comment c : prior) {
            if (c.getUserId() != null) {
                notifyUserIds.add(c.getUserId());
            }
        }
        notifyUserIds.remove(authorId);

        Comment comment = Comment.builder()
                .ticketId(ticket.getId())
                .userId(authorId)
                .content(content)
                .build();
        Comment saved = commentRepository.save(comment);

        String preview = content.length() > 120 ? content.substring(0, 117) + "..." : content;
        String summary = summarizeDescription(ticket.getDescription());
        for (String targetId : notifyUserIds) {
            notificationService.createNotification(
                    targetId,
                    NotificationType.NEW_COMMENT,
                    "New comment on ticket",
                    String.format("On \"%s\": %s", summary, preview),
                    ticket.getId(),
                    RelatedEntityType.TICKET);
        }

        return CommentResponse.fromEntity(saved);
    }

    /**
     * Helper to create a short summary of ticket description
     */
    private static String summarizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return "Support ticket";
        }
        String t = description.trim();
        return t.length() > 80 ? t.substring(0, 77) + "..." : t;
    }
}
