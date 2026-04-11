package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketCreateRequest {
    @NotBlank
    private String description;

    @NotBlank
    private String category1;

    private TicketPriority priority;
}
