package com.travelplanner.roost.booking;

import com.travelplanner.roost.booking.dto.BookingDto;
import com.travelplanner.roost.booking.dto.CreateBookingRequest;
import com.travelplanner.roost.common.security.UserPrincipal;
import com.travelplanner.roost.common.web.ApiEnvelope;
import com.travelplanner.roost.common.web.ListEnvelope;
import com.travelplanner.roost.common.web.PageRequestFactory;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiEnvelope<BookingDto> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateBookingRequest request) {
        return ApiEnvelope.of(bookingService.create(principal.userId(), idempotencyKey, request));
    }

    @GetMapping("/{reference}")
    public ApiEnvelope<BookingDto> get(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String reference) {
        return ApiEnvelope.of(
                bookingService.getByReference(principal.userId(), principal.isAdmin(), reference));
    }

    @GetMapping
    public ListEnvelope<BookingDto> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {
        Pageable pageable = PageRequest.of(
                PageRequestFactory.clampPage(page) - 1,
                PageRequestFactory.clampPageSize(pageSize),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BookingDto> result = bookingService.list(principal.userId(), principal.isAdmin(), pageable);
        return ListEnvelope.from(result);
    }

    @PostMapping("/{reference}/cancel")
    public ApiEnvelope<BookingDto> cancel(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable String reference) {
        return ApiEnvelope.of(
                bookingService.cancel(principal.userId(), principal.isAdmin(), reference));
    }
}
