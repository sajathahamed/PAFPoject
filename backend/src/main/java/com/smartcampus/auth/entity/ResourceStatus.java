package com.smartcampus.auth.entity;

import java.util.Locale;

public enum ResourceStatus {
    ACTIVE, OUT_OF_SERVICE, UNDER_MAINTENANCE;

    public static ResourceStatus fromStored(String raw) {
        if (raw == null || raw.isBlank()) {
            return OUT_OF_SERVICE;
        }
        try {
            return ResourceStatus.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return OUT_OF_SERVICE;
        }
    }
}
