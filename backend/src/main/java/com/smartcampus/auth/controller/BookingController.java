package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.*;
import com.smartcampus.auth.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/conflict")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER','ADMIN')")
    public ResponseEntity<ConflictCheckResponse> checkConflict(
            @RequestParam String resourceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) String excludeBookingId) {
        return ResponseEntity.ok(bookingService.checkConflict(resourceId, start, end, excludeBookingId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER')")
    public ResponseEntity<BookingDTO> create(@Valid @RequestBody BookingCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }

    @PostMapping("/recurring")
    @PreAuthorize("hasRole('LECTURER')")
    public ResponseEntity<List<BookingDTO>> createRecurring(@Valid @RequestBody RecurringBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createRecurring(request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER','ADMIN')")
    public ResponseEntity<List<BookingDTO>> myBookings() {
        return ResponseEntity.ok(bookingService.listMine());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER','ADMIN')")
    public ResponseEntity<BookingDTO> getOne(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER')")
    public ResponseEntity<BookingDTO> update(@PathVariable String id, @Valid @RequestBody BookingUpdateRequest request) {
        return ResponseEntity.ok(bookingService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        bookingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> approve(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approve(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingDTO> reject(@PathVariable String id, @Valid @RequestBody ReasonRequest body) {
        return ResponseEntity.ok(bookingService.reject(id, body.getReason()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER','ADMIN')")
    public ResponseEntity<BookingDTO> cancel(@PathVariable String id, @RequestBody(required = false) ReasonRequest body) {
        return ResponseEntity.ok(bookingService.cancel(id, body));
    }
}
