package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private String purpose;
    private String rejectionReason;
    private String decisionBy;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;

    public static BookingResponse fromEntity(Booking b) {
        return BookingResponse.builder()
                .id(b.getId())
                .resourceId(b.getResourceId())
                .userId(b.getUserId())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .purpose(b.getPurpose())
                .rejectionReason(b.getRejectionReason())
                .decisionBy(b.getDecisionBy())
                .approvedAt(b.getApprovedAt())
                .rejectedAt(b.getRejectedAt())
                .cancelledAt(b.getCancelledAt())
                .createdAt(b.getCreatedAt())
                .build();
    }

    public static BookingResponse fromEntity(Booking b, String userName, String resourceName) {
        BookingResponse r = fromEntity(b);
        r.setUserName(userName);
        r.setResourceName(resourceName);
        return r;
    }
}
