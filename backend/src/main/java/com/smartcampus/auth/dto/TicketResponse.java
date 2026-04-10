package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Ticket;
import com.smartcampus.auth.entity.TicketCategory;
import com.smartcampus.auth.entity.TicketPriority;
import com.smartcampus.auth.entity.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private String id;
    private String reporterId;
    private String assignedId;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
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
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
