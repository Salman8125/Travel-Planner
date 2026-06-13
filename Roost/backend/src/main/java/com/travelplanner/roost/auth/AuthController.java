package com.travelplanner.roost.auth;

import com.travelplanner.roost.auth.dto.AuthResponse;
import com.travelplanner.roost.auth.dto.LoginRequest;
import com.travelplanner.roost.auth.dto.RegisterRequest;
import com.travelplanner.roost.common.security.UserPrincipal;
import com.travelplanner.roost.common.web.ApiEnvelope;
import com.travelplanner.roost.user.UserDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiEnvelope<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiEnvelope.of(authService.register(request.email(), request.password()));
    }

    @PostMapping("/login")
    public ApiEnvelope<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiEnvelope.of(authService.login(request.email(), request.password()));
    }

    @GetMapping("/me")
    public ApiEnvelope<UserDto> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiEnvelope.of(authService.me(principal.userId()));
    }
}
