package com.travelplanner.roost.room.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record AvailabilityUpsertRequest(
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull @Min(0) Integer totalRooms,
        @Min(0) Integer availableRooms,
        @DecimalMin("0.0") BigDecimal priceOverride) {}
