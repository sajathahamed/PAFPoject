package com.smartcampus.auth.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    /** Set when status is REJECTED (admin). */
    @Getter(AccessLevel.NONE)
    @Field("rejection_reason")
    private String rejectionReason;

    /** Some older documents may store the text under {@code reject_reason} instead. */
    @Field("reject_reason")
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String rejectReasonLegacy;

    /** Set when status is CANCELLED (user or admin). Admin cancellations require a reason. */
    @Field("cancellation_reason")
    private String cancellationReason;

    /** Links instances created by the same recurring request (lecturer). */
    @Field("recurring_series_id")
    private String recurringSeriesId;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    /** Explicit getters so bytecode always matches callers (avoids stale Lombok / mixed builds). */
    public String getRejectionReason() {
        if (rejectionReason != null && !rejectionReason.isBlank()) {
            return rejectionReason;
        }
        if (rejectReasonLegacy != null && !rejectReasonLegacy.isBlank()) {
            return rejectReasonLegacy;
        }
        return null;
    }

    /** Legacy name used by some compiled call sites; same as {@link #getRejectionReason()}. */
    public String getRejectReason() {
        return getRejectionReason();
    }

    /** Avoid persisting both {@code rejection_reason} and {@code reject_reason} after an update. */
    public void clearRejectReasonLegacy() {
        this.rejectReasonLegacy = null;
    }
}
