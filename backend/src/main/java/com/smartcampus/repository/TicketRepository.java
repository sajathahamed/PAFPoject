package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByAssignedTechnicianId(String technicianId);

    List<Ticket> findByAssignedTechnicianIdAndStatus(String technicianId, String status);

    Optional<Ticket> findByIdAndAssignedTechnicianId(String id, String technicianId);
}
