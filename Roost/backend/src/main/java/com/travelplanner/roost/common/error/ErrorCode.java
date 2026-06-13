package com.travelplanner.roost.common.error;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    VALIDATION_ERROR("validation_error", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED("unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("forbidden", HttpStatus.FORBIDDEN),
    NOT_FOUND("not_found", HttpStatus.NOT_FOUND),
    CONFLICT("conflict", HttpStatus.CONFLICT),
    THROTTLED("throttled", HttpStatus.TOO_MANY_REQUESTS),
    PAYMENT_FAILED("payment_failed", HttpStatus.PAYMENT_REQUIRED),
    INTERNAL_ERROR("internal_error", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final HttpStatus status;

    ErrorCode(String code, HttpStatus status) {
        this.code = code;
        this.status = status;
    }

    public String code() {
        return code;
    }

    public HttpStatus status() {
        return status;
    }
}
