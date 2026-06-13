package com.travelplanner.roost.common.payment;

public record PaymentResult(boolean success, String reference, String message) {

    public static PaymentResult approved(String reference) {
        return new PaymentResult(true, reference, "approved");
    }

    public static PaymentResult declined(String reference, String message) {
        return new PaymentResult(false, reference, message);
    }
}
