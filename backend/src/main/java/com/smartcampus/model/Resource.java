package com.smartcampus.model;

import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    private String id;

    @Indexed
    private String name;

    private ResourceType type;

    private int capacity;

    @Indexed
    private String location;

    private ResourceStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}

