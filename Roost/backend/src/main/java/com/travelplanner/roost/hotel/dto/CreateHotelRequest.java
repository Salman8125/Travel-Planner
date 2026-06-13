package com.travelplanner.roost.hotel.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateHotelRequest(
        @NotBlank @Size(max = 160) String name,
        @Size(max = 2000) String description,
        @NotBlank @Size(max = 120) String city,
        @NotBlank @Size(min = 2, max = 2) String country,
        @Size(max = 255) String address,
        @NotNull @Min(1) @Max(5) Integer starRating,
        @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
        @NotBlank @Size(max = 64) String timezone,
        List<@Size(max = 40) String> amenities) {}
