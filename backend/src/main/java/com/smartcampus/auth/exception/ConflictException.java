package com.smartcampus.auth.exception;

/**
 * Exception thrown when an operation conflicts with current state (HTTP 409).
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}

