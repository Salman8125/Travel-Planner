package com.travelplanner.roost.common.error;

import com.travelplanner.roost.common.web.RequestIdFilter;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ErrorResponse> handleDomain(DomainException ex) {
        return build(ex.errorCode(), ex.getMessage(), ex.details());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleBodyValidation(MethodArgumentNotValidException ex) {
        Map<String, String> details = new LinkedHashMap<>();
        for (var error : ex.getBindingResult().getFieldErrors()) {
            details.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        for (var error : ex.getBindingResult().getGlobalErrors()) {
            details.putIfAbsent(error.getObjectName(), error.getDefaultMessage());
        }
        return build(ErrorCode.VALIDATION_ERROR, "Request validation failed", details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraint(ConstraintViolationException ex) {
        Map<String, String> details = new LinkedHashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> details.putIfAbsent(lastNode(v.getPropertyPath().toString()), v.getMessage()));
        return build(ErrorCode.VALIDATION_ERROR, "Request validation failed", details);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(MissingServletRequestParameterException ex) {
        return build(
                ErrorCode.VALIDATION_ERROR,
                "Missing required parameter",
                Map.of(ex.getParameterName(), "is required"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return build(
                ErrorCode.VALIDATION_ERROR,
                "Invalid parameter",
                Map.of(ex.getName(), "is malformed"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadable(HttpMessageNotReadableException ex) {
        return build(ErrorCode.VALIDATION_ERROR, "Malformed or missing request body", null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleIntegrity(DataIntegrityViolationException ex) {
        log.warn("data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return build(ErrorCode.CONFLICT, "The request conflicts with existing data", null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return build(ErrorCode.FORBIDDEN, "You do not have permission to perform this action", null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex) {
        log.error("unhandled error", ex);
        return build(ErrorCode.INTERNAL_ERROR, "An internal error occurred", null);
    }

    private ResponseEntity<ErrorResponse> build(ErrorCode code, String message, Map<String, String> details) {
        String requestId = MDC.get(RequestIdFilter.MDC_KEY);
        return ResponseEntity.status(code.status())
                .header(RequestIdFilter.HEADER, requestId)
                .body(ErrorResponse.of(code, message, details, requestId));
    }

    private static String lastNode(String path) {
        int idx = path.lastIndexOf('.');
        return idx >= 0 ? path.substring(idx + 1) : path;
    }
}
