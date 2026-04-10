package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.BookingResponse;
import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import com.smartcampus.auth.entity.NotificationType;
import com.smartcampus.auth.entity.RelatedEntityType;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingWorkflowService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public BookingResponse updateStatus(@NonNull String bookingId, @NonNull BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        BookingStatus previous = booking.getStatus();
        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);

        String ownerId = saved.getUserId();
        if (ownerId != null && previous != newStatus) {
            if (newStatus == BookingStatus.APPROVED) {
                notificationService.createNotification(
                        ownerId,
                        NotificationType.BOOKING_APPROVED,
                        "Booking approved",
                        "Your booking request has been approved.",
                        saved.getId(),
                        RelatedEntityType.BOOKING);
            } else if (newStatus == BookingStatus.REJECTED) {
                notificationService.createNotification(
                        ownerId,
                        NotificationType.BOOKING_REJECTED,
                        "Booking rejected",
                        "Your booking request has been rejected.",
                        saved.getId(),
                        RelatedEntityType.BOOKING);
            }
        }

        return BookingResponse.fromEntity(saved);
    }
}
