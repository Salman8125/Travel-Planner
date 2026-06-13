package com.travelplanner.roost.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.travelplanner.roost.booking.dto.BookingDto;
import com.travelplanner.roost.booking.dto.CreateBookingRequest;
import com.travelplanner.roost.booking.dto.GuestRequest;
import com.travelplanner.roost.common.config.RoostProperties;
import com.travelplanner.roost.common.error.ConflictException;
import com.travelplanner.roost.common.error.PaymentFailedException;
import com.travelplanner.roost.common.error.ValidationException;
import com.travelplanner.roost.common.payment.MockPaymentGateway;
import com.travelplanner.roost.hotel.Hotel;
import com.travelplanner.roost.hotel.HotelRepository;
import com.travelplanner.roost.room.RoomService;
import com.travelplanner.roost.room.RoomType;
import com.travelplanner.roost.room.RoomTypeAvailability;
import com.travelplanner.roost.room.RoomTypeAvailabilityRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BookingServiceTest {

    @Mock BookingRepository bookings;
    @Mock RoomTypeAvailabilityRepository availability;
    @Mock RoomService roomService;
    @Mock HotelRepository hotels;
    @Mock BookingMapper mapper;

    final MockPaymentGateway gateway = new MockPaymentGateway();
    final RoostProperties properties = new RoostProperties(
            new RoostProperties.Jwt("secret", Duration.ofHours(1)),
            new RoostProperties.Booking(30, 10, 2),
            new RoostProperties.RateLimit(true, 120, 20, 30),
            new RoostProperties.Cors(List.of()),
            new RoostProperties.Seed(false));

    BookingService service;
    UUID userId;
    RoomType roomType;
    Hotel hotel;

    @BeforeEach
    void setUp() {
        service = new BookingService(bookings, availability, roomService, hotels, gateway, mapper, properties);
        userId = UUID.randomUUID();
        roomType = newRoomType(2, new BigDecimal("100.00"), "USD");
        hotel = newHotel("UTC");
        when(roomService.getRoomTypeOrThrow(any())).thenReturn(roomType);
        when(hotels.findById(any())).thenReturn(Optional.of(hotel));
        when(bookings.existsByReference(any())).thenReturn(false);
        when(bookings.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toDto(any(Booking.class))).thenReturn(dummyDto());
    }

    private CreateBookingRequest request(LocalDate in, LocalDate out, int rooms, String email, String currency) {
        return new CreateBookingRequest(
                UUID.randomUUID(), in, out, rooms,
                List.of(new GuestRequest("Test", "Guest", null)), email, currency);
    }

    private LocalDate future() {
        return LocalDate.now(ZoneOffset.UTC).plusDays(3);
    }

    @Test
    void rejectsCheckInInThePast() {
        LocalDate yesterday = LocalDate.now(ZoneOffset.UTC).minusDays(1);
        assertThatThrownBy(() ->
                        service.create(userId, null, request(yesterday, yesterday.plusDays(1), 1, "g@x.io", null)))
                .isInstanceOf(ValidationException.class);
        verify(bookings, never()).save(any());
    }

    @Test
    void rejectsStayLongerThanCap() {
        LocalDate in = future();
        assertThatThrownBy(() ->
                        service.create(userId, null, request(in, in.plusDays(31), 1, "g@x.io", null)))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void rejectsCurrencyMismatch() {
        LocalDate in = future();
        assertThatThrownBy(() ->
                        service.create(userId, null, request(in, in.plusDays(1), 1, "g@x.io", "EUR")))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void rejectsGuestsExceedingCapacity() {
        LocalDate in = future();
        CreateBookingRequest request = new CreateBookingRequest(
                UUID.randomUUID(), in, in.plusDays(1), 1,
                List.of(new GuestRequest("A", "A", null), new GuestRequest("B", "B", null),
                        new GuestRequest("C", "C", null)),
                "g@x.io", null);
        assertThatThrownBy(() -> service.create(userId, null, request))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void rejectsInsufficientAvailability() {
        LocalDate in = future();
        when(availability.lockNightsForUpdate(any(), any(), any()))
                .thenReturn(List.of(night(in, 2, 0)));
        assertThatThrownBy(() ->
                        service.create(userId, null, request(in, in.plusDays(1), 1, "g@x.io", null)))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Insufficient availability");
        verify(bookings, never()).save(any());
    }

    @Test
    void idempotentReplayReturnsExistingBooking() {
        Booking existing = new Booking();
        when(bookings.findByIdempotencyKey("key-1")).thenReturn(Optional.of(existing));
        LocalDate in = future();
        service.create(userId, "key-1", request(in, in.plusDays(1), 1, "g@x.io", null));
        verify(roomService, never()).getRoomTypeOrThrow(any());
        verify(bookings, never()).save(any());
    }

    @Test
    void confirmsAndDecrementsOnSuccess() {
        LocalDate in = future();
        RoomTypeAvailability n1 = night(in, 5, 5);
        RoomTypeAvailability n2 = night(in.plusDays(1), 5, 5);
        when(availability.lockNightsForUpdate(any(), any(), any())).thenReturn(List.of(n1, n2));

        service.create(userId, null, request(in, in.plusDays(2), 2, "g@x.io", null));

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookings).save(captor.capture());
        Booking saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(saved.getTotalPrice()).isEqualByComparingTo("400.00");
        assertThat(n1.getAvailableRooms()).isEqualTo(3);
        assertThat(n2.getAvailableRooms()).isEqualTo(3);
    }

    @Test
    void declinedPaymentThrowsAndDoesNotSave() {
        LocalDate in = future();
        when(availability.lockNightsForUpdate(any(), any(), any()))
                .thenReturn(List.of(night(in, 5, 5)));
        assertThatThrownBy(() ->
                        service.create(userId, null, request(in, in.plusDays(1), 1, "decline@x.io", null)))
                .isInstanceOf(PaymentFailedException.class);
        verify(bookings, never()).save(any());
    }

    private RoomType newRoomType(int capacity, BigDecimal price, String currency) {
        RoomType rt = new RoomType();
        ReflectionTestUtils.setField(rt, "id", UUID.randomUUID());
        rt.setHotelId(UUID.randomUUID());
        rt.setName("Standard");
        rt.setCapacity(capacity);
        rt.setBasePricePerNight(price);
        rt.setCurrency(currency);
        return rt;
    }

    private Hotel newHotel(String timezone) {
        Hotel h = new Hotel();
        h.setTimezone(timezone);
        h.setName("Test");
        return h;
    }

    private RoomTypeAvailability night(LocalDate date, int total, int available) {
        RoomTypeAvailability a = new RoomTypeAvailability();
        a.setRoomTypeId(UUID.randomUUID());
        a.setDate(date);
        a.setTotalRooms(total);
        a.setAvailableRooms(available);
        return a;
    }

    private BookingDto dummyDto() {
        return new BookingDto(
                UUID.randomUUID(), "ABC123", userId, UUID.randomUUID(), UUID.randomUUID(),
                LocalDate.now(), LocalDate.now().plusDays(1), 1, 1, BookingStatus.CONFIRMED,
                new BigDecimal("100.00"), "USD", "g@x.io", null, null, List.of());
    }
}
