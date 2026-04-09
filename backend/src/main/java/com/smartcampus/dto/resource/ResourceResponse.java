package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;

import java.time.LocalDateTime;

public record ResourceResponse(
        String id,
        String name,
        ResourceType type,
        int capacity,
        String location,
        ResourceStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}

