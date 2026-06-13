package com.travelplanner.roost.common.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "roost")
public record RoostProperties(
        @NotNull @Valid Jwt jwt,
        @NotNull @Valid Booking booking,
        @NotNull @Valid RateLimit rateLimit,
        @NotNull @Valid Cors cors,
        @NotNull @Valid Seed seed) {

    public record Jwt(
            @NotBlank String secret,
            @DefaultValue("24h") Duration ttl) {}

    public record Booking(
            @DefaultValue("30") @Min(1) int maxStayNights,
            @DefaultValue("10") @Min(1) int maxRooms,
            @DefaultValue("2") @Min(0) int cancellationCutoffDays) {}

    public record RateLimit(
            @DefaultValue("true") boolean enabled,
            @DefaultValue("120") int globalPerMinute,
            @DefaultValue("20") int authPerMinute,
            @DefaultValue("30") int bookingPerMinute) {}

    public record Cors(@DefaultValue List<String> origins) {

        public List<String> sanitizedOrigins() {
            return origins == null
                    ? List.of()
                    : origins.stream().map(String::trim).filter(s -> !s.isBlank()).toList();
        }
    }

    public record Seed(@DefaultValue("false") boolean enabled) {}
}
