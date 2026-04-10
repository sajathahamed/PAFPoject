package com.smartcampus.auth.dto;

import com.smartcampus.auth.entity.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResourceOptionResponse {
    private String id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String status;

    public static BookingResourceOptionResponse fromEntity(Resource resource) {
        return BookingResourceOptionResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType() != null ? resource.getType().name() : null)
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .status(resource.getStatus() != null ? resource.getStatus().name() : null)
                .build();
    }
}
