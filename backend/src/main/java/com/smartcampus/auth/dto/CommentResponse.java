package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Comment;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {
    private String id;
    private String ticketId;
    private String userId;
    private String content;
    private LocalDateTime createdAt;

    public static CommentResponse fromEntity(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .ticketId(c.getTicketId())
                .userId(c.getUserId())
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
