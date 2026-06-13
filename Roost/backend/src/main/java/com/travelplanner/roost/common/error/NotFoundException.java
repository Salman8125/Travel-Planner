package com.travelplanner.roost.common.error;

public class NotFoundException extends DomainException {

    public NotFoundException(String message) {
        super(message, null);
    }

    @Override
    public ErrorCode errorCode() {
        return ErrorCode.NOT_FOUND;
    }
}
