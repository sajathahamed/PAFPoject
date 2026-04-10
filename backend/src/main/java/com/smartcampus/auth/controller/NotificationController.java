package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.NotificationDTO;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.service.AuthService;
import com.smartcampus.auth.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    /**
     * List notifications for the current user.
     *
     * @param isRead when omitted, returns all; {@code false} = unread only; {@code true} = read only
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @RequestParam(required = false) Boolean isRead) {
        User currentUser = authService.getCurrentUser();
        List<NotificationDTO> notifications =
                notificationService.getNotificationsForUser(currentUser.getId(), isRead);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        long count = notificationService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String id) {
        User currentUser = authService.getCurrentUser();
        NotificationDTO notification = notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
