package com.smartcampus.auth.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Ticket categories for support tickets.
 * Uses custom JSON serialization to handle spaces and legacy values.
 */
public enum TicketCategory {
    NETWORK("NETWORK"),
    HARDWARE("HARDWARE"),
    FACILITY("FACILITY"),
    SOFTWARE("SOFTWARE"),
    OTHER("OTHER"),
    IT_INFRASTRUCTURE("IT_INFRASTRUCTURE"),
    ELECTRICAL("ELECTRICAL"),
    PLUMBING("PLUMBING"),
    HVAC("HVAC"),
    IT_SUPPORT("IT_SUPPORT"),
    FURNITURE("FURNITURE"),
    MAINTENANCE("MAINTENANCE"),
    AV_EQUIPMENT("AV Equipment"),  // Handle space in database value
    SECURITY("SECURITY"),
    CLEANING("CLEANING");

    private final String value;

    TicketCategory(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TicketCategory fromValue(String value) {
        if (value == null) {
            return null;
        }
        // Normalize: trim and handle both underscores and spaces
        String normalized = value.trim().toUpperCase().replace(" ", "_");
        
        for (TicketCategory category : TicketCategory.values()) {
            // Match by enum name or by stored value
            if (category.name().equals(normalized) || 
                category.value.equalsIgnoreCase(value.trim())) {
                return category;
            }
        }
        // Fallback to OTHER if unknown category
        return OTHER;
    }
}
