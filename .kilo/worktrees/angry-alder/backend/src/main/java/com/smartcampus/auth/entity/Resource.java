package com.smartcampus.auth.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id;

    @Field("name")
    private String name;

    @Field("type")
    private ResourceType type;

    @Field("capacity")
    private Integer capacity;

    @Field("location")
    private String location;

    @Field("status")
    private ResourceStatus status;

    @Field("specifications")
    private Map<String, Object> specifications;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
