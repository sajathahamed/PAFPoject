package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.BookingResponse;
import com.smartcampus.auth.dto.BookingStatusUpdateRequest;
import com.smartcampus.auth.service.BookingWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lecturer/bookings")
@RequiredArgsConstructor
public class LecturerBookingController {

    private final BookingWorkflowService bookingWorkflowService;

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable @NonNull String id,
            @Valid @NonNull @RequestBody BookingStatusUpdateRequest body) {
        return ResponseEntity.ok(bookingWorkflowService.updateStatus(id, body.getStatus()));
    }
}
