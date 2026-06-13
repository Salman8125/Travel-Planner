package com.travelplanner.roost.room.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record UpdateRoomTypeRequest(
        @Size(max = 120) String name,
        @Size(max = 2000) String description,
        @Min(1) Integer capacity,
        @DecimalMin("0.0") BigDecimal basePricePerNight,
        @Size(min = 3, max = 3) String currency,
        List<@Size(max = 40) String> amenities) {}
