package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Resource;
import com.smartcampus.auth.entity.ResourceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(com.smartcampus.auth.entity.ResourceType type);

    List<Resource> findByStatusOrderByNameAsc(ResourceStatus status);
}
