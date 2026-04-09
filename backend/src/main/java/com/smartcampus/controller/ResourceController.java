package com.smartcampus.controller;

import com.smartcampus.dto.ResourceRequestDto;
import com.smartcampus.dto.ResourceResponseDto;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/resources?type=ROOM&minCapacity=50&location=Main
    @GetMapping
    public ResponseEntity<List<ResourceResponseDto>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location));
    }

    // GET /api/resources/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponseDto> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/resources
    @PostMapping
    // @PreAuthorize("hasRole('ADMIN')") // Uncomment if method security is enabled
    public ResponseEntity<ResourceResponseDto> createResource(@Valid @RequestBody ResourceRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(dto));
    }

    // PUT /api/resources/{id}
    @PutMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDto> updateResource(
            @PathVariable String id,
            @Valid @RequestBody ResourceRequestDto dto) {
        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // DELETE /api/resources/{id}
    @DeleteMapping("/{id}")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/resources/{id}/status?status=OUT_OF_SERVICE
    @PatchMapping("/{id}/status")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponseDto> updateResourceStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }
}
