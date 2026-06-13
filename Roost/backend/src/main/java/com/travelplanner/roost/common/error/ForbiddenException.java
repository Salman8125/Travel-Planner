package com.travelplanner.roost.common.error;

public class ForbiddenException extends DomainException {

    public ForbiddenException(String message) {
        super(message, null);
    }

    @Override
    public ErrorCode errorCode() {
        return ErrorCode.FORBIDDEN;
    }
}
