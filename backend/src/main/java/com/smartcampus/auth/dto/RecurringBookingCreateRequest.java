package com.smartcampus.auth.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
public class RecurringBookingCreateRequest {
    @NotBlank(message = "Resource is required")
    private String resourceId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Min(value = 1, message = "Occurrences must be at least 1")
    private int occurrences = 1;

    @Min(value = 1, message = "Interval days must be at least 1")
    private int intervalDays = 7;

    private LocalDate startDate;

    private LocalDate endDate;

    private List<Integer> daysOfWeek;

    private LocalTime slotStartTime;

    private LocalTime slotEndTime;

    private String purpose;
}

