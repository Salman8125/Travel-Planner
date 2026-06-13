package com.travelplanner.roost.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull UUID roomTypeId,
        @NotNull LocalDate checkInDate,
        @NotNull LocalDate checkOutDate,
        @NotNull @Min(1) Integer numberOfRooms,
        @NotEmpty @Valid List<GuestRequest> guests,
        @NotBlank @Email String contactEmail,
        @Size(min = 3, max = 3) String currency) {}
