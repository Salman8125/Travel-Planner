package com.travelplanner.roost.hotel;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface HotelRepository
        extends JpaRepository<Hotel, UUID>, JpaSpecificationExecutor<Hotel> {

    boolean existsByCityIgnoreCaseAndNameIgnoreCase(String city, String name);
}
