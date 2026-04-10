package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingStatusUpdateRequest {
    @NotNull
    private BookingStatus status;
}
