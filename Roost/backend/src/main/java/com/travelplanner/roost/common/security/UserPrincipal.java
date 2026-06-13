package com.travelplanner.roost.common.security;

import com.travelplanner.roost.common.domain.Role;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public record UserPrincipal(UUID userId, String email, Role role) {

    public Collection<? extends GrantedAuthority> authorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
