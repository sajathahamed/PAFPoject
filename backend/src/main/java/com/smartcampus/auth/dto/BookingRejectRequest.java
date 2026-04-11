package com.smartcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingRejectRequest {
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}

