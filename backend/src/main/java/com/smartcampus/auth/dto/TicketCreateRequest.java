package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.TicketCategory;
import com.smartcampus.auth.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketCreateRequest {
    @NotBlank
    private String description;

    @NotNull
    private TicketCategory category;

    private TicketPriority priority;
}
