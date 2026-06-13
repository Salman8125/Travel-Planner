package com.travelplanner.roost.booking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.travelplanner.roost.booking.BookingStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BookingDto(
        UUID id,
        String reference,
        UUID userId,
        UUID hotelId,
        UUID roomTypeId,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        int numberOfRooms,
        int numberOfGuests,
        BookingStatus status,
        BigDecimal totalPrice,
        String currency,
        String contactEmail,
        Instant createdAt,
        Instant cancelledAt,
        List<GuestDto> guests) {}
