package com.smartcampus.controller;

import com.smartcampus.dto.resource.ResourceCreateRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.resource.ResourceStatusUpdateRequest;
import com.smartcampus.dto.resource.ResourceUpdateRequest;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/resources?type=ROOM&capacity=30&location=Malabe&status=ACTIVE&q=Hall
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> list(
            @RequestParam Optional<ResourceType> type,
            @RequestParam Optional<Integer> capacity,
            @RequestParam Optional<String> location,
            @RequestParam Optional<ResourceStatus> status,
            @RequestParam Optional<String> q
    ) {
        return ResponseEntity.ok(resourceService.list(type, capacity, location, status, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ResourceResponse> create(@Valid @RequestBody ResourceCreateRequest req) {
        ResourceResponse created = resourceService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> update(
            @PathVariable String id,
            @Valid @RequestBody ResourceUpdateRequest req
    ) {
        return ResponseEntity.ok(resourceService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> patchStatus(
            @PathVariable String id,
            @Valid @RequestBody ResourceStatusUpdateRequest req
    ) {
        return ResponseEntity.ok(resourceService.updateStatus(id, req));
    }
}

