package com.travelplanner.roost.common.error;

import java.util.Map;

public class ConflictException extends DomainException {

    public ConflictException(String message) {
        super(message, null);
    }

    public ConflictException(String message, Map<String, String> details) {
        super(message, details);
    }

    @Override
    public ErrorCode errorCode() {
        return ErrorCode.CONFLICT;
    }
}
