package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Ticket;
import com.smartcampus.auth.entity.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByReporterId(String reporterId);
    List<Ticket> findByAssignedId(String assignedId);
    List<Ticket> findByStatus(TicketStatus status);
}
