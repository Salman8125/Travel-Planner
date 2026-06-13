package com.travelplanner.roost.common.error;

public class UnauthorizedException extends DomainException {

    public UnauthorizedException(String message) {
        super(message, null);
    }

    @Override
    public ErrorCode errorCode() {
        return ErrorCode.UNAUTHORIZED;
    }
}
