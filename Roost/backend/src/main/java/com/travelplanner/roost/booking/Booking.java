package com.travelplanner.roost.booking;

import com.travelplanner.roost.common.domain.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "bookings")
@Getter
@Setter
public class Booking extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;

    @Column(name = "room_type_id", nullable = false)
    private UUID roomTypeId;

    @Column(name = "check_in_date", nullable = false)
    private LocalDate checkInDate;

    @Column(name = "check_out_date", nullable = false)
    private LocalDate checkOutDate;

    @Column(name = "number_of_rooms", nullable = false)
    private int numberOfRooms;

    @Column(name = "number_of_guests", nullable = false)
    private int numberOfGuests;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private String currency;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "booking_id", nullable = false)
    private List<Guest> guests = new ArrayList<>();
}
