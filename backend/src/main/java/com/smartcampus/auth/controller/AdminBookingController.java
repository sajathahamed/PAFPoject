package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.BookingDTO;
import com.smartcampus.auth.dto.BulkIdsRequest;
import com.smartcampus.auth.dto.BulkRejectRequest;
import com.smartcampus.auth.entity.BookingStatus;
import com.smartcampus.auth.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> list(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) String requesterName,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(bookingService.listForAdmin(status, resourceId, requesterName, from, to));
    }

    @PostMapping("/bulk-approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> bulkApprove(@Valid @RequestBody BulkIdsRequest request) {
        return ResponseEntity.ok(bookingService.bulkApprove(request));
    }

    @PostMapping("/bulk-reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDTO>> bulkReject(@Valid @RequestBody BulkRejectRequest request) {
        return ResponseEntity.ok(bookingService.bulkReject(request));
    }
}
