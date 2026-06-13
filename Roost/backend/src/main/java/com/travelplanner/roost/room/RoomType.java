package com.travelplanner.roost.room;

import com.travelplanner.roost.common.domain.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "room_types")
@Getter
@Setter
public class RoomType extends BaseEntity {

    @Column(name = "hotel_id", nullable = false)
    private UUID hotelId;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private int capacity;

    @Column(name = "base_price_per_night", nullable = false)
    private BigDecimal basePricePerNight;

    @Column(nullable = false)
    private String currency;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "room_type_amenities", joinColumns = @JoinColumn(name = "room_type_id"))
    @Column(name = "amenity")
    private Set<String> amenities = new LinkedHashSet<>();
}
