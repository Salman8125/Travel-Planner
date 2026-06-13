package com.travelplanner.roost.hotel;

import com.travelplanner.roost.common.domain.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.util.LinkedHashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "hotels")
@Getter
@Setter
public class Hotel extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String country;

    @Column
    private String address;

    @Column(name = "star_rating", nullable = false)
    private int starRating;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private String timezone;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "hotel_amenities", joinColumns = @JoinColumn(name = "hotel_id"))
    @Column(name = "amenity")
    private Set<String> amenities = new LinkedHashSet<>();
}
