package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.NotificationDTO;
import com.smartcampus.auth.entity.Notification;
import com.smartcampus.auth.entity.NotificationType;
import com.smartcampus.auth.entity.RelatedEntityType;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(
            String userId,
            NotificationType type,
            String title,
            String message,
            String relatedId,
            RelatedEntityType relatedEntityType) {

        RelatedEntityType rel = relatedEntityType != null ? relatedEntityType : RelatedEntityType.NONE;
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .message(message)
                .relatedId(relatedId)
                .relatedEntityType(rel)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.debug("Created notification for user {}: {}", userId, type);
        return saved;
    }

    public List<NotificationDTO> getNotificationsForUser(String userId, Boolean isReadFilter) {
        List<Notification> list;
        if (isReadFilter == null) {
            list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            list = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, isReadFilter);
        }
        return list.stream().map(NotificationDTO::fromEntity).collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationDTO markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        if (!userId.equals(notification.getUserId())) {
            throw new ResourceNotFoundException("Notification not found");
        }
        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        log.debug("Marked notification {} as read", notificationId);
        return NotificationDTO.fromEntity(saved);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unread) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
        log.debug("Marked all notifications as read for user {}", userId);
    }
}
