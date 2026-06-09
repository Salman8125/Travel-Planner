package com.travelplanner.roost.domain;

import java.math.BigDecimal;
import java.util.List;

// Domain layer — pure business logic with typed inputs/outputs. MUST NOT touch HTTP.
// A later A2A phase wraps these methods directly. Plain class (no Spring annotations) so the
// domain stays framework-agnostic; the web layer instantiates it.
public class HotelService {

    // Hardcoded mock data. Zero external calls.
    // At least two options per city, with a price/star spread so users can compare and decide.
    private static final List<HotelRecord> HOTELS = List.of(
            // London
            new HotelRecord("HT-2001", "The Thames View", "London", 4, "180.00", List.of("WiFi", "Breakfast", "Pool")),
            new HotelRecord("HT-2002", "Camden Boutique", "London", 3, "120.50", List.of("WiFi", "Pet Friendly")),
            new HotelRecord("HT-2003", "Mayfair Grand", "London", 5, "320.00", List.of("WiFi", "Spa", "Concierge", "Breakfast")),
            // Tokyo
            new HotelRecord("HT-2004", "Shinjuku Tower Hotel", "Tokyo", 5, "260.00", List.of("WiFi", "Spa", "Gym", "Breakfast")),
            new HotelRecord("HT-2005", "Asakusa Garden Ryokan", "Tokyo", 4, "175.00", List.of("WiFi", "Onsen", "Breakfast")),
            new HotelRecord("HT-2006", "Ueno Capsule Stay", "Tokyo", 3, "95.00", List.of("WiFi", "Shared Lounge")),
            // Paris
            new HotelRecord("HT-2007", "Le Marais Inn", "Paris", 4, "210.75", List.of("WiFi", "Breakfast")),
            new HotelRecord("HT-2008", "Montmartre Loft", "Paris", 3, "140.00", List.of("WiFi", "Kitchenette")),
            new HotelRecord("HT-2009", "Champs Palace", "Paris", 5, "365.50", List.of("WiFi", "Spa", "Fine Dining", "Concierge"))
    );

    /** Search hotels in a city for a number of nights. Null/blank city = all; nights<1 -> 1. */
    public List<HotelOption> searchHotels(String city, Integer nights) {
        int n = (nights == null || nights < 1) ? 1 : nights;
        return HOTELS.stream()
                .filter(h -> city == null || city.isBlank() || h.city().equalsIgnoreCase(city.trim()))
                .map(h -> h.toOption(n))
                .toList();
    }

    /** Look up a single hotel by id (returns 0 or 1 element to keep the skill return uniform). */
    public List<HotelOption> getHotelDetails(String hotelId) {
        return HOTELS.stream()
                .filter(h -> h.hotelId().equals(hotelId))
                .map(h -> h.toOption(1))
                .toList();
    }

    // Internal mock record carrying the per-night price + city used for filtering.
    private record HotelRecord(String hotelId, String name, String city, int starRating,
                               String pricePerNight, List<String> amenities) {
        HotelOption toOption(int nights) {
            BigDecimal ppn = new BigDecimal(pricePerNight);
            return new HotelOption(hotelId, name, starRating, ppn,
                    ppn.multiply(BigDecimal.valueOf(nights)), amenities);
        }
    }
}
