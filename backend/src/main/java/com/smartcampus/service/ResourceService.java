package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDto;
import com.smartcampus.dto.ResourceResponseDto;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

import java.util.List;

public interface ResourceService {

    List<ResourceResponseDto> getAllResources(ResourceType type, Integer minCapacity, String location);

    ResourceResponseDto getResourceById(String id);

    ResourceResponseDto createResource(ResourceRequestDto resourceRequestDto);

    ResourceResponseDto updateResource(String id, ResourceRequestDto resourceRequestDto);

    void deleteResource(String id);

    ResourceResponseDto updateResourceStatus(String id, ResourceStatus status);
}
