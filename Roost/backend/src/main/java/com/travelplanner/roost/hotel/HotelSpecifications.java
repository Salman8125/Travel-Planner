package com.travelplanner.roost.hotel;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

final class HotelSpecifications {

    private HotelSpecifications() {}

    static Specification<Hotel> matching(String city, String country, Integer starRating) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (city != null && !city.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }
            if (country != null && !country.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("country")), country.trim().toLowerCase()));
            }
            if (starRating != null) {
                predicates.add(cb.equal(root.get("starRating"), starRating));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
