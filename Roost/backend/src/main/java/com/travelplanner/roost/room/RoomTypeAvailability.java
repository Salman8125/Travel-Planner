package com.travelplanner.roost.room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "room_type_availability")
@Getter
@Setter
public class RoomTypeAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "room_type_id", nullable = false)
    private UUID roomTypeId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_rooms", nullable = false)
    private int totalRooms;

    @Column(name = "available_rooms", nullable = false)
    private int availableRooms;

    @Column(name = "price_override")
    private BigDecimal priceOverride;
}
