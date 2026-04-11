package com.smartcampus.auth.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BookingConflictCheckResponse {
    private boolean conflict;
    private List<String> conflictingBookingIds;
}

