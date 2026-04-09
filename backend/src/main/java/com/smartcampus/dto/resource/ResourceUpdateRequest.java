package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResourceUpdateRequest(
        @NotBlank String name,
        @NotNull ResourceType type,
        @Min(1) int capacity,
        @NotBlank String location,
        @NotNull ResourceStatus status
) {}

