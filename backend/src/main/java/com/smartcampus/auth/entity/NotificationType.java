package com.smartcampus.auth.entity;

/**
 * Kind of event that produced the notification.
 */
public enum NotificationType {
    BOOKING_UPDATE,
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    TICKET_ASSIGNED,
    TICKET_STATUS_CHANGED,
    NEW_COMMENT,
    SYSTEM_ALERT
}
