package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Collection;
import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);
    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            Collection<BookingStatus> statuses,
            LocalDateTime endExclusive,
            LocalDateTime startExclusive
    );

    List<Booking> findByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanAndIdNot(
            String resourceId,
            Collection<BookingStatus> statuses,
            LocalDateTime endExclusive,
            LocalDateTime startExclusive,
            String excludedBookingId
    );

    List<Booking> findByStatus(BookingStatus status);
}
