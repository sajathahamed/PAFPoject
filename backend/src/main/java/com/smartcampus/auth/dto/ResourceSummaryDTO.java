package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Resource;
import com.smartcampus.auth.entity.ResourceStatus;
import com.smartcampus.auth.entity.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceSummaryDTO {

    private String id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;

    public static ResourceSummaryDTO fromEntity(Resource r) {
        return ResourceSummaryDTO.builder()
                .id(r.getId())
                .name(r.getName())
                .type(r.getType())
                .capacity(r.getCapacity())
                .location(r.getLocation())
                .status(r.getStatus())
                .build();
    }
}
