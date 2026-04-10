package com.smartcampus.auth.entity;

import java.util.Locale;

public enum ResourceType {
    LABROOM,
    /** Common legacy / external values stored in MongoDB */
    ROOM,
    CLASSROOM,
    HALL,
    MEETING_ROOM,
    AUDITORIUM,
    PROJECTOR,
    EQUIPMENT,
    OTHER;

    /**
     * Parse values from MongoDB without throwing (unknown → OTHER). Accepts any case.
     */
    public static ResourceType fromStored(String raw) {
        if (raw == null || raw.isBlank()) {
            return OTHER;
        }
        String n = raw.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        try {
            return ResourceType.valueOf(n);
        } catch (IllegalArgumentException ex) {
            return OTHER;
        }
    }
}
