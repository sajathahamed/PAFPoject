package com.smartcampus.auth.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@CompoundIndexes({
    @CompoundIndex(name = "booking_conflict_idx", def = "{'resourceId': 1, 'startTime': 1, 'endTime': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id;

    @Field("resource_id")
    private String resourceId;

    @Field("user_id")
    private String userId;

    @Field("start_time")
    private LocalDateTime startTime;

    @Field("end_time")
    private LocalDateTime endTime;

    @Field("status")
    private BookingStatus status;

    @Field("purpose")
    private String purpose;

    @Field("rejection_reason")
    private String rejectionReason;

    @Field("decision_by")
    private String decisionBy;

    @Field("approved_at")
    private LocalDateTime approvedAt;

    @Field("rejected_at")
    private LocalDateTime rejectedAt;

    @Field("cancelled_at")
    private LocalDateTime cancelledAt;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
