package com.smartcampus.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple message response for operations like logout.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private String message;
    
    public static MessageResponse of(String message) {
        return new MessageResponse(message);
    }
}
