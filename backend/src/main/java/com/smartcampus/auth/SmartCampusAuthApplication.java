package com.smartcampus.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application entry point for Smart Campus Operations Hub - Auth Module.
 * 
 * This module provides OAuth2 Google authentication, JWT token management,
 * and role-based access control for the Smart Campus platform.
 * 
 * @author Smart Campus Team
 * @version 1.0.0
 */
@SpringBootApplication
public class SmartCampusAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusAuthApplication.class, args);
    }
}
