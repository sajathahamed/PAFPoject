package com.smartcampus.auth.controller;

import com.smartcampus.auth.entity.Resource;
import com.smartcampus.auth.entity.ResourceStatus;
import com.smartcampus.auth.entity.ResourceType;
import com.smartcampus.auth.exception.ResourceNotFoundException;
import com.smartcampus.auth.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location
    ) {
        return resourceRepository.findAll().stream()
                .filter(resource -> matchesType(resource, type))
                .filter(resource -> minCapacity == null || (resource.getCapacity() != null && resource.getCapacity() >= minCapacity))
                .filter(resource -> matchesLocation(resource, location))
                .sorted(Comparator.comparing(Resource::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Resource createResource(@RequestBody Resource resource) {
        resource.setId(null);
        resource.setType(normalizeType(resource.getType()));
        resource.setStatus(normalizeStatus(resource.getStatus()));
        resource.setSpecifications(defaultSpecifications(resource.getSpecifications()));
        return resourceRepository.save(resource);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateResource(@PathVariable String id, @RequestBody Resource resource) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        existing.setName(resource.getName());
        existing.setType(normalizeType(resource.getType()));
        existing.setCapacity(resource.getCapacity());
        existing.setLocation(resource.getLocation());
        existing.setStatus(normalizeStatus(resource.getStatus()));
        existing.setSpecifications(defaultSpecifications(resource.getSpecifications()));
        return resourceRepository.save(existing);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateStatus(@PathVariable String id, @RequestParam String status) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));

        existing.setStatus(normalizeStatus(ResourceStatus.valueOf(status.trim().toUpperCase(Locale.ROOT))));
        return resourceRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> deleteResource(@PathVariable String id) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + id));
        resourceRepository.delete(existing);
        return Map.of("message", "Resource deleted successfully");
    }

    private boolean matchesType(Resource resource, String type) {
        if (type == null || type.isBlank()) {
            return true;
        }
        ResourceType normalizedType = ResourceType.valueOf(type.trim().toUpperCase(Locale.ROOT));
        return resource.getType() == normalizedType;
    }

    private boolean matchesLocation(Resource resource, String location) {
        if (location == null || location.isBlank()) {
            return true;
        }
        return resource.getLocation() != null
                && resource.getLocation().toLowerCase(Locale.ROOT).contains(location.trim().toLowerCase(Locale.ROOT));
    }

    private ResourceType normalizeType(ResourceType type) {
        return type == null ? ResourceType.ROOM : type;
    }

    private ResourceStatus normalizeStatus(ResourceStatus status) {
        return status == null ? ResourceStatus.ACTIVE : status;
    }

    private Map<String, Object> defaultSpecifications(Map<String, Object> specifications) {
        return specifications == null ? Map.of() : specifications;
    }
}