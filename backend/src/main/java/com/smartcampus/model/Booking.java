package com.smartcampus.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    // Resource being booked (e.g., "Lecture Hall A", "Lab 1", etc.)
    private String resource;

    // User who created the booking
    private String createdBy; // User._id

    // Assigned to (for approval workflow)
    private String assignedTo; // User._id (Admin/Technician)

    // Title/description
    private String title;
    private String description;

    // Date and time
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Status: PENDING, APPROVED, REJECTED, CANCELLED
    private String status;

    // For recurring bookings
    private boolean recurring;
    private String recurrencePattern; // e.g., "WEEKLY", "DAILY"

    // Rejection reason (if rejected)
    private String rejectionReason;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}