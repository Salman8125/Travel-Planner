package com.travelplanner.roost.common.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.roost.common.config.RoostProperties;
import com.travelplanner.roost.common.error.ErrorCode;
import com.travelplanner.roost.common.error.ErrorResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_BUCKETS = 50_000;

    private final RoostProperties properties;
    private final ObjectMapper mapper;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(RoostProperties properties, ObjectMapper mapper) {
        this.properties = properties;
        this.mapper = mapper;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        RoostProperties.RateLimit config = properties.rateLimit();
        String path = request.getRequestURI();
        if (!config.enabled() || !path.startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        String scope;
        int perMinute;
        if (path.startsWith("/api/auth/")) {
            scope = "auth";
            perMinute = config.authPerMinute();
        } else if (path.startsWith("/api/bookings") && "POST".equalsIgnoreCase(request.getMethod())) {
            scope = "booking";
            perMinute = config.bookingPerMinute();
        } else {
            scope = "global";
            perMinute = config.globalPerMinute();
        }

        if (buckets.size() > MAX_BUCKETS) {
            buckets.clear();
        }
        String key = scope + "|" + request.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket(perMinute));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            writeThrottled(response);
        }
    }

    private static Bucket newBucket(int perMinute) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(perMinute)
                .refillGreedy(perMinute, Duration.ofMinutes(1))
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private void writeThrottled(HttpServletResponse response) throws IOException {
        String requestId = MDC.get(RequestIdFilter.MDC_KEY);
        response.setStatus(ErrorCode.THROTTLED.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(RequestIdFilter.HEADER, requestId);
        mapper.writeValue(
                response.getWriter(),
                ErrorResponse.of(ErrorCode.THROTTLED, "Too many requests, please slow down", null, requestId));
    }
}
