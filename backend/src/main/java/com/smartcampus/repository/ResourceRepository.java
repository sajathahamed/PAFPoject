package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    
    // Custom query to find resources matching all filters if provided
    @Query("{ " +
            "   $and: [ " +
            "       { $or: [ { $expr: { $eq: ['?0', 'null'] } }, { 'type': ?0 } ] }, " +
            "       { $or: [ { $expr: { $eq: [?1, null] } }, { 'capacity': { $gte: ?1 } } ] }, " +
            "       { $or: [ { $expr: { $eq: ['?2', ''] } }, { 'location': { $regex: ?2, $options: 'i' } } ] } " +
            "   ] " +
            "}")
    List<Resource> findByFilters(ResourceType type, Integer minCapacity, String location);
}
