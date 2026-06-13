package com.travelplanner.roost.hotel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record HotelSearchRequest(
        @NotBlank String city,
        String country,
        @NotNull LocalDate checkInDate,
        @NotNull LocalDate checkOutDate,
        @NotNull @Min(1) Integer guests,
        @Min(1) Integer rooms,
        @Min(1) @Max(5) Integer starRating,
        @DecimalMin("0.0") BigDecimal priceMin,
        @DecimalMin("0.0") BigDecimal priceMax,
        List<@Size(max = 40) String> amenities,
        String sortBy,
        String order,
        @Min(1) Integer page,
        @Min(1) Integer pageSize) {}
