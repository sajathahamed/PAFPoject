package com.smartcampus.auth.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

    @Id
    private String id;

    @Field("ticket_id")
    private String ticketId;

    @Field("user_id")
    private String userId;

    @Field("content")
    private String content;

    @Field("edited")
    @Builder.Default
    private Boolean edited = false;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
