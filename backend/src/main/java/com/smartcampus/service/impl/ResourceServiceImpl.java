package com.smartcampus.service.impl;

import com.smartcampus.dto.resource.ResourceCreateRequest;
import com.smartcampus.dto.resource.ResourceResponse;
import com.smartcampus.dto.resource.ResourceStatusUpdateRequest;
import com.smartcampus.dto.resource.ResourceUpdateRequest;
import com.smartcampus.exception.NotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public List<ResourceResponse> list(Optional<ResourceType> type,
                                      Optional<Integer> capacity,
                                      Optional<String> location,
                                      Optional<ResourceStatus> status,
                                      Optional<String> q) {

        Query query = new Query().with(Sort.by(Sort.Direction.DESC, "createdAt"));

        type.ifPresent(t -> query.addCriteria(Criteria.where("type").is(t)));
        status.ifPresent(s -> query.addCriteria(Criteria.where("status").is(s)));

        capacity.ifPresent(min -> {
            if (min <= 0) throw new IllegalArgumentException("capacity must be > 0");
            query.addCriteria(Criteria.where("capacity").gte(min));
        });

        location.map(String::trim)
                .filter(s -> !s.isBlank())
                .ifPresent(loc ->
                        query.addCriteria(Criteria.where("location").regex(".*" + escapeRegex(loc) + ".*", "i"))
                );

        q.map(String::trim)
                .filter(s -> !s.isBlank())
                .ifPresent(term ->
                        query.addCriteria(Criteria.where("name").regex(".*" + escapeRegex(term) + ".*", "i"))
                );

        List<Resource> resources = mongoTemplate.find(query, Resource.class);
        return resources.stream().map(this::toResponse).toList();
    }

    @Override
    public ResourceResponse getById(String id) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource not found: " + id));
        return toResponse(r);
    }

    @Override
    public ResourceResponse create(ResourceCreateRequest req) {
        Resource r = Resource.builder()
                .name(req.name().trim())
                .type(req.type())
                .capacity(req.capacity())
                .location(req.location().trim())
                .status(ResourceStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        r = resourceRepository.save(r);
        return toResponse(r);
    }

    @Override
    public ResourceResponse update(String id, ResourceUpdateRequest req) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource not found: " + id));

        existing.setName(req.name().trim());
        existing.setType(req.type());
        existing.setCapacity(req.capacity());
        existing.setLocation(req.location().trim());
        existing.setStatus(req.status());
        existing.setUpdatedAt(LocalDateTime.now());

        Resource saved = resourceRepository.save(existing);
        return toResponse(saved);
    }

    @Override
    public void delete(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new NotFoundException("Resource not found: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceResponse updateStatus(String id, ResourceStatusUpdateRequest req) {
        Resource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Resource not found: " + id));

        existing.setStatus(req.status());
        existing.setUpdatedAt(LocalDateTime.now());
        Resource saved = resourceRepository.save(existing);
        return toResponse(saved);
    }

    private ResourceResponse toResponse(Resource r) {
        return new ResourceResponse(
                r.getId(),
                r.getName(),
                r.getType(),
                r.getCapacity(),
                r.getLocation(),
                r.getStatus(),
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private String escapeRegex(String s) {
        return s.replace("\\", "\\\\")
                .replace(".", "\\.")
                .replace("*", "\\*")
                .replace("?", "\\?")
                .replace("+", "\\+")
                .replace("{", "\\{")
                .replace("}", "\\}")
                .replace("[", "\\[")
                .replace("]", "\\]")
                .replace("(", "\\(")
                .replace(")", "\\)")
                .replace("^", "\\^")
                .replace("$", "\\$")
                .replace("|", "\\|");
    }
}

