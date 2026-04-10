package com.smartcampus.auth.exception;

/**
 * Exception thrown for invalid input validation errors.
 * Results in HTTP 400 Bad Request response.
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
