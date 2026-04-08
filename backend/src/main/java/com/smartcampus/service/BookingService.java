package com.smartcampus.service;

import com.smartcampus.model.Booking;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepository.findByCreatedBy(userId);
    }

    public List<Booking> getBookingsForApproval(String assignedTo) {
        return bookingRepository.findByAssignedTo(assignedTo);
    }

    public Booking createBooking(Booking booking, String createdBy) {
        // Set defaults
        booking.setCreatedBy(createdBy);
        booking.setStatus("PENDING");
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        // Assign to admin for approval (find admin user)
        Optional<User> admin = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .findFirst();
        admin.ifPresent(u -> booking.setAssignedTo(u.getId()));

        // Check for conflicts
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                booking.getResource(), booking.getStartTime(), booking.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Booking conflict detected");
        }

        return bookingRepository.save(booking);
    }

    public Booking updateBooking(String id, Booking updatedBooking) {
        Optional<Booking> existing = bookingRepository.findById(id);
        if (existing.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = existing.get();
        booking.setTitle(updatedBooking.getTitle());
        booking.setDescription(updatedBooking.getDescription());
        booking.setStartTime(updatedBooking.getStartTime());
        booking.setEndTime(updatedBooking.getEndTime());
        booking.setRecurring(updatedBooking.isRecurring());
        booking.setRecurrencePattern(updatedBooking.getRecurrencePattern());
        booking.setUpdatedAt(LocalDateTime.now());

        // Re-check conflicts if time changed
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                booking.getResource(), booking.getStartTime(), booking.getEndTime())
                .stream().filter(b -> !b.getId().equals(id)).toList();
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Booking conflict detected");
        }

        return bookingRepository.save(booking);
    }

    public Booking approveBooking(String id, String approvedBy) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();
        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not pending");
        }

        booking.setStatus("APPROVED");
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String id, String rejectedBy, String reason) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();
        if (!"PENDING".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is not pending");
        }

        booking.setStatus("REJECTED");
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String id, String cancelledBy) {
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();
        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking already cancelled");
        }

        booking.setStatus("CANCELLED");
        booking.setUpdatedAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) {
        bookingRepository.deleteById(id);
    }

    public List<Booking> checkConflicts(String resource, LocalDateTime startTime, LocalDateTime endTime) {
        return bookingRepository.findOverlappingBookings(resource, startTime, endTime);
    }

    public List<Booking> createRecurringBooking(Booking booking, String createdBy) {
        if (!booking.isRecurring() || booking.getRecurrencePattern() == null || booking.getRecurrencePattern().isEmpty()) {
            throw new RuntimeException("Invalid recurrence configuration");
        }

        List<Booking> createdBookings = new java.util.ArrayList<>();
        LocalDateTime currentStart = booking.getStartTime();
        LocalDateTime currentEnd = booking.getEndTime();
        LocalDateTime endDate = currentStart.plusMonths(3);

        int maxIterations = 100;
        int iteration = 0;

        while (currentStart.isBefore(endDate) && iteration < maxIterations) {
            Booking recurringBooking = Booking.builder()
                    .title(booking.getTitle())
                    .description(booking.getDescription())
                    .resource(booking.getResource())
                    .startTime(currentStart)
                    .endTime(currentEnd)
                    .recurring(false)
                    .recurrencePattern(null)
                    .createdBy(createdBy)
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Optional<User> admin = userRepository.findAll().stream()
                    .filter(u -> "ADMIN".equals(u.getRole()))
                    .findFirst();
            admin.ifPresent(u -> recurringBooking.setAssignedTo(u.getId()));

            List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                    recurringBooking.getResource(), recurringBooking.getStartTime(), recurringBooking.getEndTime());
            
            if (conflicts.isEmpty()) {
                recurringBooking.setStatus("APPROVED");
                createdBookings.add(bookingRepository.save(recurringBooking));
            } else {
                recurringBooking.setStatus("PENDING");
                createdBookings.add(bookingRepository.save(recurringBooking));
            }

            switch (booking.getRecurrencePattern()) {
                case "DAILY" -> {
                    currentStart = currentStart.plusDays(1);
                    currentEnd = currentEnd.plusDays(1);
                }
                case "WEEKLY" -> {
                    currentStart = currentStart.plusWeeks(1);
                    currentEnd = currentEnd.plusWeeks(1);
                }
                default -> {
                    currentStart = currentStart.plusWeeks(1);
                    currentEnd = currentEnd.plusWeeks(1);
                }
            }
            iteration++;
        }

        return createdBookings;
    }
}