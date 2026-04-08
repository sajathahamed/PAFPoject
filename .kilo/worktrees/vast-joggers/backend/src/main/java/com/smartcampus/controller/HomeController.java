package com.smartcampus.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
            "status", "ok",
            "service", "SmartCampus Backend",
            "health", "/actuator/health",
            "testDb", "/test/db"
        );
    }
}
