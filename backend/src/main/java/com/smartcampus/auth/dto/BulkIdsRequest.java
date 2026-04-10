package com.smartcampus.auth.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class BulkIdsRequest {

    @NotEmpty
    private List<String> ids;
}
