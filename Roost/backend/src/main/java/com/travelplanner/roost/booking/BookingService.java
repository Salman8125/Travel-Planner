package com.travelplanner.roost.booking;

import com.travelplanner.roost.booking.dto.BookingDto;
import com.travelplanner.roost.booking.dto.CreateBookingRequest;
import com.travelplanner.roost.booking.dto.GuestRequest;
import com.travelplanner.roost.common.config.RoostProperties;
import com.travelplanner.roost.common.error.ConflictException;
import com.travelplanner.roost.common.error.ForbiddenException;
import com.travelplanner.roost.common.error.NotFoundException;
import com.travelplanner.roost.common.error.PaymentFailedException;
import com.travelplanner.roost.common.error.ValidationException;
import com.travelplanner.roost.common.payment.MockPaymentGateway;
import com.travelplanner.roost.common.payment.PaymentResult;
import com.travelplanner.roost.hotel.Hotel;
import com.travelplanner.roost.hotel.HotelRepository;
import com.travelplanner.roost.room.RoomService;
import com.travelplanner.roost.room.RoomType;
import com.travelplanner.roost.room.RoomTypeAvailability;
import com.travelplanner.roost.room.RoomTypeAvailabilityRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private static final String REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int REFERENCE_LENGTH = 6;

    private final BookingRepository bookings;
    private final RoomTypeAvailabilityRepository availability;
    private final RoomService roomService;
    private final HotelRepository hotels;
    private final MockPaymentGateway paymentGateway;
    private final BookingMapper mapper;
    private final RoostProperties properties;
    private final SecureRandom random = new SecureRandom();

    public BookingService(
            BookingRepository bookings,
            RoomTypeAvailabilityRepository availability,
            RoomService roomService,
            HotelRepository hotels,
            MockPaymentGateway paymentGateway,
            BookingMapper mapper,
            RoostProperties properties) {
        this.bookings = bookings;
        this.availability = availability;
        this.roomService = roomService;
        this.hotels = hotels;
        this.paymentGateway = paymentGateway;
        this.mapper = mapper;
        this.properties = properties;
    }

    @Transactional
    public BookingDto create(UUID userId, String idempotencyKey, CreateBookingRequest request) {
        String key = (idempotencyKey == null || idempotencyKey.isBlank()) ? null : idempotencyKey.trim();

        if (key != null) {
            var existing = bookings.findByIdempotencyKey(key);
            if (existing.isPresent()) {
                return mapper.toDto(existing.get());
            }
        }

        RoomType roomType = roomService.getRoomTypeOrThrow(request.roomTypeId());
        Hotel hotel = hotels.findById(roomType.getHotelId())
                .orElseThrow(() -> new NotFoundException("Hotel not found"));
        LocalDate checkIn = request.checkInDate();
        LocalDate checkOut = request.checkOutDate();
        int rooms = request.numberOfRooms();
        int guests = request.guests().size();
        String currency = validate(roomType, hotel, checkIn, checkOut, rooms, guests, request.currency());

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        List<RoomTypeAvailability> locked =
                availability.lockNightsForUpdate(roomType.getId(), checkIn, checkOut);
        if (locked.size() < nights) {
            Set<LocalDate> present = new LinkedHashSet<>();
            locked.forEach(a -> present.add(a.getDate()));
            throw new ConflictException(
                    "No inventory is configured for some nights in the range",
                    Map.of("unavailableNights", join(missingNights(checkIn, checkOut, present))));
        }

        List<String> shortNights = locked.stream()
                .filter(a -> a.getAvailableRooms() < rooms)
                .map(a -> a.getDate().toString())
                .toList();
        if (!shortNights.isEmpty()) {
            throw new ConflictException(
                    "Insufficient availability for the requested number of rooms",
                    Map.of("unavailableNights", join(shortNights)));
        }

        BigDecimal perRoomTotal = BigDecimal.ZERO;
        for (RoomTypeAvailability night : locked) {
            night.setAvailableRooms(night.getAvailableRooms() - rooms);
            BigDecimal nightly = night.getPriceOverride() != null
                    ? night.getPriceOverride()
                    : roomType.getBasePricePerNight();
            perRoomTotal = perRoomTotal.add(nightly);
        }
        BigDecimal totalPrice = perRoomTotal
                .multiply(BigDecimal.valueOf(rooms))
                .setScale(2, RoundingMode.HALF_UP);

        Booking booking = new Booking();
        booking.setReference(generateReference());
        booking.setUserId(userId);
        booking.setHotelId(roomType.getHotelId());
        booking.setRoomTypeId(roomType.getId());
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setNumberOfRooms(rooms);
        booking.setNumberOfGuests(guests);
        booking.setStatus(BookingStatus.PENDING);
        booking.setTotalPrice(totalPrice);
        booking.setCurrency(currency);
        booking.setContactEmail(request.contactEmail().trim());
        booking.setIdempotencyKey(key);
        for (GuestRequest g : request.guests()) {
            Guest guest = new Guest();
            guest.setFirstName(g.firstName().trim());
            guest.setLastName(g.lastName().trim());
            guest.setDateOfBirth(g.dateOfBirth());
            booking.getGuests().add(guest);
        }

        PaymentResult payment =
                paymentGateway.charge(booking.getReference(), totalPrice, currency, booking.getContactEmail());
        if (!payment.success()) {
            throw new PaymentFailedException("Payment was declined: " + payment.message());
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        bookings.save(booking);
        return mapper.toDto(booking);
    }

    @Transactional
    public BookingDto cancel(UUID userId, boolean isAdmin, String reference) {
        Booking booking = bookings.findByReference(reference)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ForbiddenException("You cannot cancel another user's booking");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return mapper.toDto(booking);
        }

        Hotel hotel = hotels.findById(booking.getHotelId())
                .orElseThrow(() -> new NotFoundException("Hotel not found"));
        LocalDate today = LocalDate.now(ZoneId.of(hotel.getTimezone()));
        LocalDate cutoff = booking.getCheckInDate().minusDays(properties.booking().cancellationCutoffDays());
        if (!today.isBefore(cutoff)) {
            throw new ConflictException("The cancellation window for this booking has closed");
        }

        List<RoomTypeAvailability> locked = availability.lockNightsForUpdate(
                booking.getRoomTypeId(), booking.getCheckInDate(), booking.getCheckOutDate());
        for (RoomTypeAvailability night : locked) {
            night.setAvailableRooms(
                    Math.min(night.getTotalRooms(), night.getAvailableRooms() + booking.getNumberOfRooms()));
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        return mapper.toDto(booking);
    }

    @Transactional(readOnly = true)
    public BookingDto getByReference(UUID userId, boolean isAdmin, String reference) {
        Booking booking = bookings.findByReference(reference)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ForbiddenException("You cannot view another user's booking");
        }
        return mapper.toDto(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingDto> list(UUID userId, boolean isAdmin, Pageable pageable) {
        Page<Booking> page = isAdmin
                ? bookings.findAll(pageable)
                : bookings.findByUserId(userId, pageable);
        return page.map(mapper::toDto);
    }

    private String validate(
            RoomType roomType,
            Hotel hotel,
            LocalDate checkIn,
            LocalDate checkOut,
            int rooms,
            int guests,
            String requestedCurrency) {
        if (!checkIn.isBefore(checkOut)) {
            throw new ValidationException(
                    "checkInDate must be before checkOutDate",
                    Map.of("checkOutDate", "must be after checkInDate"));
        }
        LocalDate today = LocalDate.now(ZoneId.of(hotel.getTimezone()));
        if (checkIn.isBefore(today)) {
            throw new ValidationException(
                    "checkInDate cannot be in the past",
                    Map.of("checkInDate", "must be today or later in the hotel's timezone"));
        }
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        int maxStay = properties.booking().maxStayNights();
        if (nights > maxStay) {
            throw new ValidationException(
                    "Stay length exceeds the maximum of " + maxStay + " nights",
                    Map.of("checkOutDate", "stay is too long"));
        }
        int maxRooms = properties.booking().maxRooms();
        if (rooms > maxRooms) {
            throw new ValidationException(
                    "Cannot book more than " + maxRooms + " rooms in one booking",
                    Map.of("numberOfRooms", "exceeds the per-booking maximum"));
        }
        if ((long) roomType.getCapacity() * rooms < guests) {
            throw new ValidationException(
                    "Too many guests for the selected rooms",
                    Map.of("guests", "exceeds the capacity of " + rooms + " room(s)"));
        }
        String currency = requestedCurrency == null ? roomType.getCurrency() : requestedCurrency.toUpperCase();
        if (!currency.equalsIgnoreCase(roomType.getCurrency())) {
            throw new ConflictException(
                    "Booking currency must match the room type currency (" + roomType.getCurrency() + ")");
        }
        return roomType.getCurrency();
    }

    private String generateReference() {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder sb = new StringBuilder(REFERENCE_LENGTH);
            for (int i = 0; i < REFERENCE_LENGTH; i++) {
                sb.append(REFERENCE_ALPHABET.charAt(random.nextInt(REFERENCE_ALPHABET.length())));
            }
            String reference = sb.toString();
            if (!bookings.existsByReference(reference)) {
                return reference;
            }
        }
        throw new ConflictException("Could not allocate a booking reference; please retry");
    }

    private static List<String> missingNights(LocalDate checkIn, LocalDate checkOut, Set<LocalDate> present) {
        List<String> missing = new ArrayList<>();
        for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
            if (!present.contains(date)) {
                missing.add(date.toString());
            }
        }
        return missing;
    }

    private static String join(List<String> nights) {
        return String.join(",", nights);
    }
}
