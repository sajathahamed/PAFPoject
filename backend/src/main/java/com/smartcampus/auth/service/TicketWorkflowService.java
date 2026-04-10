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

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketWorkflowService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    public TicketResponse createTicket(String reporterId, TicketCreateRequest request) {
        TicketPriority priority = request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM;
        Ticket ticket = Ticket.builder()
                .reporterId(reporterId)
                .category(request.getCategory())
                .description(request.getDescription().trim())
                .priority(priority)
                .status(TicketStatus.OPEN)
                .build();
        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    public List<TicketResponse> listTicketsForReporter(String reporterId) {
        return ticketRepository.findByReporterId(reporterId).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<TicketResponse> listTicketsForTechnician() {
        return ticketRepository.findAll().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TicketResponse updateTicketStatus(String ticketId, TicketStatus newStatus) {
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
        return TicketResponse.fromEntity(saved);
    }

    public CommentResponse addCommentAsStudent(String ticketId, String userId, CommentCreateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        if (!userId.equals(ticket.getReporterId())) {
            throw new AccessDeniedException("You can only comment on your own tickets");
        }
        return addCommentInternal(ticket, userId, request.getContent().trim());
    }

    public CommentResponse addCommentAsTechnician(String ticketId, String userId, CommentCreateRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return addCommentInternal(ticket, userId, request.getContent().trim());
    }

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

    private static String summarizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return "Support ticket";
        }
        String t = description.trim();
        return t.length() > 80 ? t.substring(0, 77) + "..." : t;
    }
}
