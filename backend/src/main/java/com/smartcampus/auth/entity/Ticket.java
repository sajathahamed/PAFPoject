package com.smartcampus.auth.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    private String id;

    @Field("reporter_id")
    private String reporterId;

    @Field("assigned_id")
    private String assignedId;

    @Field("category")
    private String category;

    @Field("description")
    private String description;

    @Field("priority")
    private TicketPriority priority;

    @Field("status")
    private TicketStatus status;

    @Field("images")
    private List<String> images;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
