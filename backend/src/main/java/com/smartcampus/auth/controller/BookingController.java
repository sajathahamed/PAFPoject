package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.BookingConflictCheckResponse;
import com.smartcampus.auth.dto.BookingCreateRequest;
import com.smartcampus.auth.dto.BookingRejectRequest;
import com.smartcampus.auth.dto.BookingResourceOptionResponse;
import com.smartcampus.auth.dto.BookingResponse;
import com.smartcampus.auth.dto.RecurringBookingCreateRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.service.AuthService;
import com.smartcampus.auth.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    @GetMapping("/conflict")
    public ResponseEntity<BookingConflictCheckResponse> checkConflict(
            @RequestParam String resourceId,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end
    ) {
        return ResponseEntity.ok(bookingService.checkConflict(resourceId, start, end));
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingCreateRequest request) {
        User user = requireUser();
        return ResponseEntity.ok(bookingService.createBooking(user.getId(), request));
    }

    @GetMapping("/resources")
    public ResponseEntity<List<BookingResourceOptionResponse>> resources() {
        return ResponseEntity.ok(bookingService.listResourceOptions());
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings() {
        User user = requireUser();
        return ResponseEntity.ok(bookingService.listMyBookings(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> get(@PathVariable String id) {
        User user = requireUser();
        boolean isAdmin = user.getRole() != null && "ADMIN".equals(user.getRole().name());
        return ResponseEntity.ok(bookingService.getBookingForViewer(id, user.getId(), isAdmin));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approve(@PathVariable String id) {
        User admin = requireUser();
        return ResponseEntity.ok(bookingService.approve(id, admin.getId()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> reject(
            @PathVariable String id,
            @Valid @RequestBody BookingRejectRequest request
    ) {
        User admin = requireUser();
        return ResponseEntity.ok(bookingService.reject(id, admin.getId(), request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable String id) {
        User user = requireUser();
        return ResponseEntity.ok(bookingService.cancel(id, user.getId()));
    }

    @PostMapping("/recurring")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<BookingResponse>> recurring(@Valid @RequestBody RecurringBookingCreateRequest request) {
        User lecturer = requireUser();
        return ResponseEntity.ok(bookingService.createRecurringAutoApproved(lecturer.getId(), request));
    }

    private User requireUser() {
        User u = authService.getCurrentUser();
        if (u == null) throw new AccessDeniedException("Authentication required");
        return u;
    }
}

