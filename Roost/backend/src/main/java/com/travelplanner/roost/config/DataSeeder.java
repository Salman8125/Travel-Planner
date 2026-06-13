package com.travelplanner.roost.config;

import com.travelplanner.roost.common.config.RoostProperties;
import com.travelplanner.roost.common.domain.Role;
import com.travelplanner.roost.hotel.Hotel;
import com.travelplanner.roost.hotel.HotelRepository;
import com.travelplanner.roost.room.RoomType;
import com.travelplanner.roost.room.RoomTypeAvailability;
import com.travelplanner.roost.room.RoomTypeAvailabilityRepository;
import com.travelplanner.roost.room.RoomTypeRepository;
import com.travelplanner.roost.user.User;
import com.travelplanner.roost.user.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final int INVENTORY_DAYS = 30;

    private final RoostProperties properties;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final HotelRepository hotels;
    private final RoomTypeRepository roomTypes;
    private final RoomTypeAvailabilityRepository availability;

    public DataSeeder(
            RoostProperties properties,
            UserRepository users,
            PasswordEncoder passwordEncoder,
            HotelRepository hotels,
            RoomTypeRepository roomTypes,
            RoomTypeAvailabilityRepository availability) {
        this.properties = properties;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.hotels = hotels;
        this.roomTypes = roomTypes;
        this.availability = availability;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!properties.seed().enabled()) {
            return;
        }
        if (users.count() > 0) {
            log.info("Seed skipped: data already present");
            return;
        }
        log.info("Seeding Roost reference data...");
        seedUsers();
        seedHotels();
        log.info("Seed complete: {} users, {} hotels", users.count(), hotels.count());
    }

    private void seedUsers() {
        users.save(newUser("admin@roost.dev", "admin12345", Role.ADMIN));
        users.save(newUser("user@roost.dev", "user12345", Role.USER));
    }

    private User newUser(String email, String rawPassword, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        return user;
    }

    private void seedHotels() {
        LocalDate today = LocalDate.now();
        List<HotelSpec> specs = List.of(
                new HotelSpec("The Bosphorus Grand", "Istanbul", "TR", "Europe/Istanbul", 5, 41.0082, 28.9784,
                        amenities("WiFi", "Pool", "Spa", "Restaurant", "Bar")),
                new HotelSpec("Margalla View Hotel", "Islamabad", "PK", "Asia/Karachi", 4, 33.6844, 73.0479,
                        amenities("WiFi", "Gym", "Restaurant", "Parking")),
                new HotelSpec("Old City Boutique", "Lahore", "PK", "Asia/Karachi", 3, 31.5204, 74.3587,
                        amenities("WiFi", "Restaurant")),
                new HotelSpec("Marina Pearl", "Dubai", "AE", "Asia/Dubai", 5, 25.2048, 55.2708,
                        amenities("WiFi", "Pool", "Spa", "Gym", "Bar", "Parking")),
                new HotelSpec("Corniche Suites", "Doha", "QA", "Asia/Qatar", 4, 25.2854, 51.5310,
                        amenities("WiFi", "Pool", "Restaurant", "Gym")),
                new HotelSpec("The Thames View", "London", "GB", "Europe/London", 4, 51.5074, -0.1278,
                        amenities("WiFi", "Breakfast", "Bar", "Gym")),
                new HotelSpec("Le Petit Louvre", "Paris", "FR", "Europe/Paris", 4, 48.8566, 2.3522,
                        amenities("WiFi", "Breakfast", "Bar")),
                new HotelSpec("Midtown Central", "New York", "US", "America/New_York", 4, 40.7128, -74.0060,
                        amenities("WiFi", "Gym", "Restaurant", "Parking")));

        for (HotelSpec spec : specs) {
            Hotel hotel = new Hotel();
            hotel.setName(spec.name());
            hotel.setDescription("A " + spec.starRating() + "-star stay in " + spec.city() + ".");
            hotel.setCity(spec.city());
            hotel.setCountry(spec.country());
            hotel.setAddress("1 " + spec.city() + " Avenue");
            hotel.setStarRating(spec.starRating());
            hotel.setLatitude(spec.latitude());
            hotel.setLongitude(spec.longitude());
            hotel.setTimezone(spec.timezone());
            hotel.setAmenities(new LinkedHashSet<>(spec.amenities()));
            hotels.save(hotel);

            BigDecimal standardPrice = BigDecimal.valueOf(80L + spec.starRating() * 20L);
            BigDecimal deluxePrice = standardPrice.add(BigDecimal.valueOf(60));

            RoomType standard = roomType(hotel.getId(), "Standard Queen",
                    "Cozy room with a queen bed", 2, standardPrice, amenities("WiFi", "Air conditioning"));
            RoomType deluxe = roomType(hotel.getId(), "Deluxe King",
                    "Spacious room with a king bed", 3, deluxePrice,
                    amenities("WiFi", "Air conditioning", "Minibar"));
            roomTypes.save(standard);
            roomTypes.save(deluxe);

            seedAvailability(standard.getId(), today, 5);
            seedAvailability(deluxe.getId(), today, 4);
        }
    }

    private RoomType roomType(
            UUID hotelId, String name, String description, int capacity, BigDecimal price, Set<String> amenities) {
        RoomType roomType = new RoomType();
        roomType.setHotelId(hotelId);
        roomType.setName(name);
        roomType.setDescription(description);
        roomType.setCapacity(capacity);
        roomType.setBasePricePerNight(price);
        roomType.setCurrency("USD");
        roomType.setAmenities(new LinkedHashSet<>(amenities));
        return roomType;
    }

    private void seedAvailability(UUID roomTypeId, LocalDate start, int totalRooms) {
        List<RoomTypeAvailability> rows = new ArrayList<>();
        for (int i = 0; i < INVENTORY_DAYS; i++) {
            RoomTypeAvailability row = new RoomTypeAvailability();
            row.setRoomTypeId(roomTypeId);
            row.setDate(start.plusDays(i));
            row.setTotalRooms(totalRooms);
            row.setAvailableRooms(totalRooms);
            rows.add(row);
        }
        availability.saveAll(rows);
    }

    private static Set<String> amenities(String... values) {
        return new LinkedHashSet<>(List.of(values));
    }

    private record HotelSpec(
            String name,
            String city,
            String country,
            String timezone,
            int starRating,
            double latitude,
            double longitude,
            Set<String> amenities) {}
}
