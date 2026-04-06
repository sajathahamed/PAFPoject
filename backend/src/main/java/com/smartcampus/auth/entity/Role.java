package com.smartcampus.auth.entity;

/**
 * Enum representing user roles in the Smart Campus system.
 * 
 * Roles determine access levels and permissions:
 * - USER: Standard campus user (students, faculty)
 * - ADMIN: System administrator with full access
 * - TECHNICIAN: Maintenance staff with work order access
 */
public enum Role {
    STUDENT,
    LECTURER,
    TECHNICIAN,
    ADMIN
}
