package com.smartcampus.service;

import com.smartcampus.dto.ResourceRequestDto;
import com.smartcampus.dto.ResourceResponseDto;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.enums.ResourceStatus;
import com.smartcampus.model.enums.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public List<ResourceResponseDto> getAllResources(ResourceType type, Integer minCapacity, String location) {
        int capacity = minCapacity != null ? minCapacity : 0;
        String loc = location != null ? location : "";
        
        List<Resource> resources;
        if (type != null) {
            resources = resourceRepository.findByTypeAndCapacityGreaterThanEqualAndLocationContainingIgnoreCase(type, capacity, loc);
        } else {
            resources = resourceRepository.findByCapacityGreaterThanEqualAndLocationContainingIgnoreCase(capacity, loc);
        }
        
        return resources.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponseDto getResourceById(String id) {
        Resource resource = fetchResource(id);
        return mapToResponseDto(resource);
    }

    @Override
    public ResourceResponseDto createResource(ResourceRequestDto dto) {
        Resource resource = Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .status(dto.getStatus())
                .build();
        
        resource = resourceRepository.save(resource);
        return mapToResponseDto(resource);
    }

    @Override
    public ResourceResponseDto updateResource(String id, ResourceRequestDto dto) {
        Resource resource = fetchResource(id);
        
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setCapacity(dto.getCapacity());
        resource.setLocation(dto.getLocation());
        resource.setStatus(dto.getStatus());
        
        resource = resourceRepository.save(resource);
        return mapToResponseDto(resource);
    }

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    @Override
    public ResourceResponseDto updateResourceStatus(String id, ResourceStatus status) {
        Resource resource = fetchResource(id);
        resource.setStatus(status);
        resource = resourceRepository.save(resource);
        return mapToResponseDto(resource);
    }
    
    private Resource fetchResource(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }
    
    private ResourceResponseDto mapToResponseDto(Resource resource) {
        return ResourceResponseDto.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .build();
    }
}
