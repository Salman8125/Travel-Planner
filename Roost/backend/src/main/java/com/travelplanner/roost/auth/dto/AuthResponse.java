package com.travelplanner.roost.auth.dto;

import com.travelplanner.roost.user.UserDto;

public record AuthResponse(String token, UserDto user) {}
