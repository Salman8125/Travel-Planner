package com.travelplanner.roost.room.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CreateRoomTypeRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 2000) String description,
        @NotNull @Min(1) Integer capacity,
        @NotNull @DecimalMin("0.0") BigDecimal basePricePerNight,
        @NotBlank @Size(min = 3, max = 3) String currency,
        List<@NotBlank @Size(max = 40) String> amenities) {}
