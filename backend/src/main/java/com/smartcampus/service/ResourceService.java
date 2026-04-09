package com.smartcampus.service;

import com.smartcampus.dto.resource.ResourceCreateRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.resource.ResourceStatusUpdateRequest;
import com.smartcampus.dto.resource.ResourceUpdateRequest;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

import java.util.List;
import java.util.Optional;

public interface ResourceService {
    List<ResourceResponse> list(Optional<ResourceType> type,
                                Optional<Integer> capacity,
                                Optional<String> location,
                                Optional<ResourceStatus> status,
                                Optional<String> q);

    ResourceResponse getById(String id);

    ResourceResponse create(ResourceCreateRequest req);

    ResourceResponse update(String id, ResourceUpdateRequest req);

    void delete(String id);

    ResourceResponse updateStatus(String id, ResourceStatusUpdateRequest req);
}

