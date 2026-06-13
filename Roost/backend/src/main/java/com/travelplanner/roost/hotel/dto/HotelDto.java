package com.travelplanner.roost.hotel.dto;

import java.util.List;
import java.util.UUID;

public record HotelDto(
        UUID id,
        String name,
        String description,
        String city,
        String country,
        String address,
        int starRating,
        double latitude,
        double longitude,
        String timezone,
        List<String> amenities) {}
