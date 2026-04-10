package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.ResourceSummaryDTO;
import com.smartcampus.auth.entity.ResourceStatus;
import com.smartcampus.auth.entity.ResourceType;
import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private static final String COLLECTION = "resources";

    private final MongoTemplate mongoTemplate;

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER','ADMIN','TECHNICIAN')")
    public ResponseEntity<List<ResourceSummaryDTO>> listActive() {
        Query q = new Query(Criteria.where("status").is(ResourceStatus.ACTIVE));
        q.with(Sort.by(Sort.Direction.ASC, "name"));
        List<Document> docs = mongoTemplate.find(q, Document.class, COLLECTION);
        List<ResourceSummaryDTO> list = docs.stream().map(ResourceController::toSummary).toList();
        return ResponseEntity.ok(list);
    }

    private static ResourceSummaryDTO toSummary(Document doc) {
        Object idObj = doc.get("_id");
        String id = idObj != null ? idObj.toString() : null;
        return ResourceSummaryDTO.builder()
                .id(id)
                .name(doc.getString("name"))
                .type(ResourceType.fromStored(doc.getString("type")))
                .capacity(doc.getInteger("capacity"))
                .location(doc.getString("location"))
                .status(ResourceStatus.fromStored(doc.getString("status")))
                .build();
    }
}
