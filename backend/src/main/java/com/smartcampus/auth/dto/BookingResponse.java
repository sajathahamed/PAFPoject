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
    private String userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private String purpose;
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
                .createdAt(b.getCreatedAt())
                .build();
    }
}
