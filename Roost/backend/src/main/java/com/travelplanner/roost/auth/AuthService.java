package com.travelplanner.roost.auth;

import com.travelplanner.roost.auth.dto.AuthResponse;
import com.travelplanner.roost.common.domain.Role;
import com.travelplanner.roost.common.error.ConflictException;
import com.travelplanner.roost.common.error.UnauthorizedException;
import com.travelplanner.roost.common.security.JwtService;
import com.travelplanner.roost.user.User;
import com.travelplanner.roost.user.UserDto;
import com.travelplanner.roost.user.UserMapper;
import com.travelplanner.roost.user.UserRepository;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String DUMMY_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthService(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserMapper userMapper) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse register(String email, String rawPassword) {
        String normalized = normalize(email);
        if (users.existsByEmail(normalized)) {
            throw new ConflictException("Email is already registered");
        }
        User user = new User();
        user.setEmail(normalized);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(Role.USER);
        users.save(user);
        return tokenFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String email, String rawPassword) {
        User user = users.findByEmail(normalize(email)).orElse(null);
        boolean ok;
        if (user == null) {
            passwordEncoder.matches(rawPassword, DUMMY_HASH);
            ok = false;
        } else {
            ok = passwordEncoder.matches(rawPassword, user.getPasswordHash());
        }
        if (!ok) {
            throw new UnauthorizedException("Invalid email or password");
        }
        return tokenFor(user);
    }

    @Transactional(readOnly = true)
    public UserDto me(UUID userId) {
        return users.findById(userId)
                .map(userMapper::toDto)
                .orElseThrow(() -> new UnauthorizedException("Session is no longer valid"));
    }

    private AuthResponse tokenFor(User user) {
        String token = jwtService.issue(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, userMapper.toDto(user));
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
