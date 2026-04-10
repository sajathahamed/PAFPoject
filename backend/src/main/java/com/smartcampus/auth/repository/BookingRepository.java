package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    List<Booking> findByUserIdOrderByStartTimeDesc(String userId);

    /**
     * Overlap with [start, end): existing.start &lt; end AND existing.end &gt; start.
     * Only PENDING and APPROVED block the resource.
     */
    List<Booking> findByResourceIdAndStatusInAndStartTimeBeforeAndEndTimeAfter(
            String resourceId,
            Collection<BookingStatus> statuses,
            LocalDateTime endTime,
            LocalDateTime startTime);
}
