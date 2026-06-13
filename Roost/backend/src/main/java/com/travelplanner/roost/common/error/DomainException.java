package com.travelplanner.roost.common.error;

import java.util.Map;

public abstract class DomainException extends RuntimeException {

    private final transient Map<String, String> details;

    protected DomainException(String message, Map<String, String> details) {
        super(message);
        this.details = details;
    }

    public abstract ErrorCode errorCode();

    public Map<String, String> details() {
        return details;
    }
}
