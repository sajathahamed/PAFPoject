package com.smartcampus.controller;

import com.smartcampus.model.Booking;
import com.smartcampus.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getUserBookings(@PathVariable String userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    @GetMapping("/approval/{assignedTo}")
    public ResponseEntity<List<Booking>> getBookingsForApproval(@PathVariable String assignedTo) {
        return ResponseEntity.ok(bookingService.getBookingsForApproval(assignedTo));
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, @RequestHeader("X-User-Id") String userId) {
        try {
            Booking created = bookingService.createBooking(booking, userId);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable String id, @RequestBody Booking booking) {
        try {
            Booking updated = bookingService.updateBooking(id, booking);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable String id, @RequestHeader("X-User-Id") String approvedBy) {
        try {
            Booking approved = bookingService.approveBooking(id, approvedBy);
            return ResponseEntity.ok(approved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable String id, @RequestBody Map<String, String> body, @RequestHeader("X-User-Id") String rejectedBy) {
        try {
            String reason = body.get("reason");
            Booking rejected = bookingService.rejectBooking(id, rejectedBy, reason);
            return ResponseEntity.ok(rejected);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String id, @RequestHeader("X-User-Id") String cancelledBy) {
        try {
            Booking cancelled = bookingService.cancelBooking(id, cancelledBy);
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/conflicts")
    public ResponseEntity<List<Booking>> checkConflicts(
            @RequestParam String resource,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);
        return ResponseEntity.ok(bookingService.checkConflicts(resource, start, end));
    }
}