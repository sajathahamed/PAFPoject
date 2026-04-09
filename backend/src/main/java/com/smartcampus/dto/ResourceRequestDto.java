package com.smartcampus.dto;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequestDto {

    @NotBlank(message = "Resource name is mandatory")
    private String name;

    @NotNull(message = "Resource type is mandatory")
    private ResourceType type;

    @NotNull(message = "Capacity is mandatory")
    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;

    @NotBlank(message = "Location is mandatory")
    private String location;

    @NotNull(message = "Resource status is mandatory")
    private ResourceStatus status;
}
