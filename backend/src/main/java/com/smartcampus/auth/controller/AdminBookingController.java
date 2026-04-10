package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.BookingResponse;
import com.smartcampus.auth.dto.BookingStatusUpdateRequest;
import com.smartcampus.auth.entity.BookingStatus;
import com.smartcampus.auth.service.BookingService;
import com.smartcampus.auth.service.BookingWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingWorkflowService bookingWorkflowService;
    private final BookingService bookingService;

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateStatus(
            @PathVariable @NonNull String id,
            @Valid @NonNull @RequestBody BookingStatusUpdateRequest body) {
        return ResponseEntity.ok(bookingWorkflowService.updateStatus(id, body.getStatus()));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> list(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String userQuery,
            @RequestParam(required = false) String resourceQuery
    ) {
        return ResponseEntity.ok(bookingService.adminListBookings(status, userQuery, resourceQuery));
    }
}
