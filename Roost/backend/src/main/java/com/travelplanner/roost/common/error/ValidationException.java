package com.travelplanner.roost.common.error;

import java.util.Map;

public class ValidationException extends DomainException {

    public ValidationException(String message) {
        super(message, null);
    }

    public ValidationException(String message, Map<String, String> details) {
        super(message, details);
    }

    @Override
    public ErrorCode errorCode() {
        return ErrorCode.VALIDATION_ERROR;
    }
}
