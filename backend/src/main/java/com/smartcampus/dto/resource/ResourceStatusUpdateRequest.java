package com.smartcampus.dto.resource;

import com.smartcampus.model.enums.ResourceStatus;
import jakarta.validation.constraints.NotNull;

public record ResourceStatusUpdateRequest(
        @NotNull ResourceStatus status
) {}

