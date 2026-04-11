package com.smartcampus.auth.repository;

import com.smartcampus.auth.entity.Resource;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<com.smartcampus.auth.entity.Resource> findByType(com.smartcampus.auth.entity.ResourceType type);

    interface ResourceNameView {
        String getId();
        String getName();
    }

    interface ResourceOptionView {
        String getId();
        String getName();
        String getLocation();
    }

    @Query(value = "{ '_id': { $in: ?0 } }", fields = "{ '_id': 1, 'name': 1 }")
    List<ResourceNameView> findResourceNamesByIdIn(Collection<String> ids);

    @Query(value = "{}", fields = "{ '_id': 1, 'name': 1, 'location': 1 }")
    List<ResourceOptionView> findAllResourceOptions();
}
