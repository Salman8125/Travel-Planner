package com.travelplanner.roost.booking.dto;

import java.time.LocalDate;
import java.util.UUID;

public record GuestDto(UUID id, String firstName, String lastName, LocalDate dateOfBirth) {}
