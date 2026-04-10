package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Notification;
import com.smartcampus.auth.entity.NotificationType;
import com.smartcampus.auth.entity.RelatedEntityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private String id;
    private String userId;
    private NotificationType type;
    private String title;
    private String message;
    private String relatedId;
    private RelatedEntityType relatedEntityType;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedId(notification.getRelatedId())
                .relatedEntityType(notification.getRelatedEntityType() != null
                        ? notification.getRelatedEntityType()
                        : RelatedEntityType.NONE)
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}