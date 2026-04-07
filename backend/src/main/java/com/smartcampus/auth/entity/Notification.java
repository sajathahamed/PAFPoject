package com.smartcampus.auth.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("type")
    private NotificationType type;

    @Field("message")
    private String message;

    @Field("related_id")
    private String relatedId;

    @Field("is_read")
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
