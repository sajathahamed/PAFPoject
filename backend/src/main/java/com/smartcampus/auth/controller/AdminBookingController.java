package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.BookingResponse;
import com.smartcampus.auth.dto.BookingStatusUpdateRequest;
import com.smartcampus.auth.service.BookingWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingWorkflowService bookingWorkflowService;

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateRequest body) {
        return ResponseEntity.ok(bookingWorkflowService.updateStatus(id, body.getStatus()));
    }
}
