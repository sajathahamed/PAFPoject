package com.smartcampus.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RecurringBookingRequest {

    @NotBlank
    private String resourceId;

    @NotNull
    private LocalDateTime firstStart;

    @NotNull
    private LocalDateTime firstEnd;

    /** Last calendar day (inclusive) to repeat on. */
    @NotNull
    private LocalDate recurrenceEndDate;

    /**
     * ISO-8601 day-of-week: 1 = Monday … 7 = Sunday.
     */
    @NotEmpty
    private List<Integer> repeatOnDays;

    private String purpose;
}
