package com.travelplanner.roost.hotel.dto;

import com.travelplanner.roost.room.dto.RoomTypeOffer;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record HotelSearchItem(
        UUID hotelId,
        String name,
        String description,
        String city,
        String country,
        int starRating,
        String timezone,
        List<String> amenities,
        String currency,
        BigDecimal pricePerNight,
        BigDecimal totalPrice,
        List<RoomTypeOffer> roomTypes) {}
