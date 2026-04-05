package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<com.smartcampus.auth.entity.Resource> findByType(com.smartcampus.auth.entity.ResourceType type);
}
