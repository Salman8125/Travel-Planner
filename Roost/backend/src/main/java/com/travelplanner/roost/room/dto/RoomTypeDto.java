package com.travelplanner.roost.room.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RoomTypeDto(
        UUID id,
        String name,
        String description,
        int capacity,
        BigDecimal basePricePerNight,
        String currency,
        List<String> amenities) {}
