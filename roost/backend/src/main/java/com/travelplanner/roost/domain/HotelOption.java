package com.travelplanner.roost.domain;

import java.math.BigDecimal;
import java.util.List;

// Domain type — pure data carrier. No Spring/HTTP imports. BigDecimal for money.
public record HotelOption(
        String hotelId,
        String name,
        int starRating,
        BigDecimal pricePerNight,
        BigDecimal totalPrice,
        List<String> amenities
) {}
