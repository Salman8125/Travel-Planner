package com.travelplanner.roost.room.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record RoomTypeOffer(
        UUID roomTypeId,
        String name,
        String description,
        int capacity,
        String currency,
        BigDecimal pricePerNight,
        BigDecimal totalPrice,
        int availableRooms,
        List<String> amenities) {}
