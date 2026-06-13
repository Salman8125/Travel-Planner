package com.travelplanner.roost.room;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {

    List<RoomType> findByHotelId(UUID hotelId);

    List<RoomType> findByHotelIdInOrderByBasePricePerNightAsc(Collection<UUID> hotelIds);

    Optional<RoomType> findByHotelIdAndNameIgnoreCase(UUID hotelId, String name);
}
