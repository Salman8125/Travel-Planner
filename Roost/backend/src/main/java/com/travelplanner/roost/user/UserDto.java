package com.travelplanner.roost.user;

import com.travelplanner.roost.common.domain.Role;
import java.util.UUID;

public record UserDto(UUID id, String email, Role role) {}
