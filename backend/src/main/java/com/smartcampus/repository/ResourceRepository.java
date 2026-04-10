package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    List<Resource> findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
            ResourceType type, 
            Integer minCapacity, 
            String location
    );
    
    List<Resource> findByCapacityGreaterThanEqualAndLocationContainingIgnoreCase(
            Integer minCapacity, 
            String location
    );
}
