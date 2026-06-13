package com.travelplanner.roost.common.error;

public class PaymentFailedException extends DomainException {

    public PaymentFailedException(String message) {
        super(message, null);
    }

    @Override
    public ErrorCode errorCode() {
        return ErrorCode.PAYMENT_FAILED;
    }
}
