package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
