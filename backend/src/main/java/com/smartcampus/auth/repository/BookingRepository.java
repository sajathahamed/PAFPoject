package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Booking;
import com.smartcampus.auth.entity.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);
    List<Booking> findByUserId(String userId);
}
