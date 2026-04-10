package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.lang.NonNull;

@Data
public class BookingStatusUpdateRequest {
    @NotNull
    @NonNull
    private BookingStatus status;
}
