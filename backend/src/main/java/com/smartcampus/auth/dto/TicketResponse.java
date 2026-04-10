package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Ticket;
import com.smartcampus.auth.entity.TicketPriority;
import com.smartcampus.auth.entity.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Ticket Response DTO
 * 
 * Contains all ticket information returned to the client:
 * - Basic info: id, description, category, priority, status
 * - User references: reporterId, assignedId
 * - Images: List of Base64 data URLs
 * - Timestamps: createdAt, updatedAt
 */
@Data
@Builder
public class TicketResponse {
    private String id;
    private String reporterId;
    private String assignedId;
    private String category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TicketResponse fromEntity(Ticket t) {
        return TicketResponse.builder()
                .id(t.getId())
                .reporterId(t.getReporterId())
                .assignedId(t.getAssignedId())
                .category(t.getCategory())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .images(t.getImages())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
