package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {

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
    private String cancellationReason;
    private String recurringSeriesId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookingDTO fromEntity(Booking b) {
        return BookingDTO.builder()
                .id(b.getId())
                .resourceId(b.getResourceId())
                .userId(b.getUserId())
                .startTime(b.getStartTime())
                .endTime(b.getEndTime())
                .status(b.getStatus())
                .purpose(b.getPurpose())
                .rejectionReason(b.getRejectionReason())
                .cancellationReason(b.getCancellationReason())
                .recurringSeriesId(b.getRecurringSeriesId())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
