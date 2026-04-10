package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    private String title;

    private String description;

    private String category;

    // LOW | MEDIUM | HIGH
    private String priority;

    // OPEN | IN_PROGRESS | RESOLVED | CLOSED
    private String status;

    // References users._id
    private String assignedTechnicianId;

    // References users._id
    private String createdBy;

    private String resolutionNote;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
