package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByCreatedBy(String createdBy);

    List<Booking> findByAssignedTo(String assignedTo);

    List<Booking> findByStatus(String status);

    // Find overlapping bookings for conflict checking
    @Query("{ 'resource': ?0, 'status': { $in: ['PENDING', 'APPROVED'] }, $or: [ { $and: [ { 'startTime': { $lt: ?2 } }, { 'endTime': { $gt: ?1 } } ] }, { $and: [ { 'startTime': { $gte: ?1 } }, { 'startTime': { $lt: ?2 } } ] }, { $and: [ { 'endTime': { $gt: ?1 } }, { 'endTime': { $lte: ?2 } } ] } ] }")
    List<Booking> findOverlappingBookings(String resource, LocalDateTime startTime, LocalDateTime endTime);
}