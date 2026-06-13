package com.travelplanner.roost.common.payment;

import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class MockPaymentGateway {

    public PaymentResult charge(String reference, BigDecimal amount, String currency, String contactEmail) {
        if (contactEmail != null && contactEmail.toLowerCase().contains("decline")) {
            return PaymentResult.declined(reference, "Card declined");
        }
        return PaymentResult.approved(reference);
    }
}
