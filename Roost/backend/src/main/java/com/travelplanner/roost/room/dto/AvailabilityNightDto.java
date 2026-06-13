package com.travelplanner.roost.room.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record AvailabilityNightDto(
        LocalDate date, int totalRooms, int availableRooms, BigDecimal priceOverride) {}
