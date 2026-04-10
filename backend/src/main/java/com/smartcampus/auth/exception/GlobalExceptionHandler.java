package com.smartcampus.auth.exception;

import com.smartcampus.auth.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.stream.Collectors;

/**
 * Global exception handler for REST API.
 * 
 * Converts exceptions to standardized ErrorResponse format with
 * appropriate HTTP status codes.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle resource not found exceptions (404).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex, HttpServletRequest request) {
        
        log.warn("Resource not found: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle missing endpoints/static resources (404).
     * Avoids bubbling to the generic handler (500).
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
            NoResourceFoundException ex, HttpServletRequest request) {

        ErrorResponse error = ErrorResponse.of(
                "Endpoint not found",
                HttpStatus.NOT_FOUND.value(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle invalid token exceptions (401).
     */
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTokenException(
            InvalidTokenException ex, HttpServletRequest request) {
        
        log.warn("Invalid token: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle bad request exceptions (400).
     */
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequestException(
            BadRequestException ex, HttpServletRequest request) {
        
        log.warn("Bad request: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle conflict exceptions (409).
     */
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorResponse> handleConflictException(
            ConflictException ex, HttpServletRequest request) {

        log.warn("Conflict: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                HttpStatus.CONFLICT.value(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle validation errors from @Valid annotations (400).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        // Collect all field errors into a single message
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        log.warn("Validation error: {}", errors);
        
        ErrorResponse error = ErrorResponse.of(
                errors,
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle JSON parse errors (400).
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        log.warn("Invalid JSON: {}", ex.getMessage());
        
        String message = "Invalid request body format";
        if (ex.getMessage() != null && ex.getMessage().contains("Role")) {
            message = "Invalid role value. Allowed values: USER, ADMIN, TECHNICIAN";
        }
        
        ErrorResponse error = ErrorResponse.of(
                message,
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle Spring Security access denied exceptions (403).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        log.warn("Access denied: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(
                "Access denied. You don't have permission to access this resource.",
                HttpStatus.FORBIDDEN.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handle Spring Security authentication exceptions (401).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        log.warn("Authentication failed: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(
                "Authentication required. Please log in.",
                HttpStatus.UNAUTHORIZED.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Handle illegal argument exceptions (400).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {
        
        log.warn("Illegal argument: {}", ex.getMessage());
        
        ErrorResponse error = ErrorResponse.of(
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle all other uncaught exceptions (500).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        log.error("Unexpected error at {}: {} ", request.getRequestURI(), ex.getMessage(), ex);
        
        String message = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred";
        
        ErrorResponse error = ErrorResponse.of(
                message,
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                request.getRequestURI()
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
