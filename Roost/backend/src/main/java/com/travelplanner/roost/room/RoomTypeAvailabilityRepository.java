package com.travelplanner.roost.room;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;

public interface RoomTypeAvailabilityRepository extends JpaRepository<RoomTypeAvailability, UUID> {

    @Query("""
            select a from RoomTypeAvailability a
            where a.roomTypeId = :roomTypeId
              and a.date >= :checkIn and a.date < :checkOut
            order by a.date asc
            """)
    List<RoomTypeAvailability> findNights(
            @Param("roomTypeId") UUID roomTypeId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Query("""
            select a from RoomTypeAvailability a
            where a.roomTypeId in :roomTypeIds
              and a.date >= :checkIn and a.date < :checkOut
            """)
    List<RoomTypeAvailability> findNightsForRoomTypes(
            @Param("roomTypeIds") Collection<UUID> roomTypeIds,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "5000"))
    @Query("""
            select a from RoomTypeAvailability a
            where a.roomTypeId = :roomTypeId
              and a.date >= :checkIn and a.date < :checkOut
            order by a.date asc
            """)
    List<RoomTypeAvailability> lockNightsForUpdate(
            @Param("roomTypeId") UUID roomTypeId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    Optional<RoomTypeAvailability> findByRoomTypeIdAndDate(UUID roomTypeId, LocalDate date);
}
