package com.travelplanner.roost.room;

import com.travelplanner.roost.common.error.NotFoundException;
import com.travelplanner.roost.common.error.ValidationException;
import com.travelplanner.roost.room.dto.AvailabilityNightDto;
import com.travelplanner.roost.room.dto.AvailabilityUpsertRequest;
import com.travelplanner.roost.room.dto.CreateRoomTypeRequest;
import com.travelplanner.roost.room.dto.RoomTypeDto;
import com.travelplanner.roost.room.dto.RoomTypeOffer;
import com.travelplanner.roost.room.dto.UpdateRoomTypeRequest;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoomService {

    private final RoomTypeRepository roomTypes;
    private final RoomTypeAvailabilityRepository availability;
    private final RoomTypeMapper mapper;

    public RoomService(
            RoomTypeRepository roomTypes,
            RoomTypeAvailabilityRepository availability,
            RoomTypeMapper mapper) {
        this.roomTypes = roomTypes;
        this.availability = availability;
        this.mapper = mapper;
    }

    public RoomType getRoomTypeOrThrow(UUID roomTypeId) {
        return roomTypes.findById(roomTypeId)
                .orElseThrow(() -> new NotFoundException("Room type not found"));
    }

    @Transactional(readOnly = true)
    public List<RoomTypeDto> roomTypesForHotel(UUID hotelId) {
        return roomTypes.findByHotelId(hotelId).stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<RoomTypeOffer> offersForHotel(UUID hotelId, LocalDate checkIn, LocalDate checkOut) {
        List<RoomType> types = roomTypes.findByHotelId(hotelId);
        return buildOffers(types, checkIn, checkOut);
    }

    @Transactional(readOnly = true)
    public Map<UUID, List<RoomTypeOffer>> offersForHotels(
            Collection<UUID> hotelIds, LocalDate checkIn, LocalDate checkOut) {
        if (hotelIds.isEmpty()) {
            return Map.of();
        }
        List<RoomType> types = roomTypes.findByHotelIdInOrderByBasePricePerNightAsc(hotelIds);
        Map<UUID, List<RoomType>> byHotel = types.stream()
                .collect(Collectors.groupingBy(RoomType::getHotelId, LinkedHashMap::new, Collectors.toList()));
        Map<UUID, Map<LocalDate, RoomTypeAvailability>> nights =
                loadAvailability(types.stream().map(RoomType::getId).toList(), checkIn, checkOut);

        Map<UUID, List<RoomTypeOffer>> result = new LinkedHashMap<>();
        byHotel.forEach((hotelId, list) ->
                result.put(hotelId, buildOffersWithNights(list, checkIn, checkOut, nights)));
        return result;
    }

    @Transactional
    public RoomTypeDto createRoomType(UUID hotelId, CreateRoomTypeRequest request) {
        RoomType roomType = new RoomType();
        roomType.setHotelId(hotelId);
        roomType.setName(request.name().trim());
        roomType.setDescription(request.description());
        roomType.setCapacity(request.capacity());
        roomType.setBasePricePerNight(request.basePricePerNight());
        roomType.setCurrency(request.currency().toUpperCase());
        if (request.amenities() != null) {
            roomType.setAmenities(new LinkedHashSet<>(request.amenities()));
        }
        roomTypes.save(roomType);
        return mapper.toDto(roomType);
    }

    @Transactional
    public RoomTypeDto updateRoomType(UUID roomTypeId, UpdateRoomTypeRequest request) {
        RoomType roomType = getRoomTypeOrThrow(roomTypeId);
        if (request.name() != null) {
            roomType.setName(request.name().trim());
        }
        if (request.description() != null) {
            roomType.setDescription(request.description());
        }
        if (request.capacity() != null) {
            roomType.setCapacity(request.capacity());
        }
        if (request.basePricePerNight() != null) {
            roomType.setBasePricePerNight(request.basePricePerNight());
        }
        if (request.currency() != null) {
            roomType.setCurrency(request.currency().toUpperCase());
        }
        if (request.amenities() != null) {
            roomType.setAmenities(new LinkedHashSet<>(request.amenities()));
        }
        return mapper.toDto(roomType);
    }

    @Transactional
    public void deleteRoomType(UUID roomTypeId) {
        roomTypes.delete(getRoomTypeOrThrow(roomTypeId));
    }

    @Transactional
    public List<AvailabilityNightDto> upsertAvailability(UUID roomTypeId, AvailabilityUpsertRequest request) {
        getRoomTypeOrThrow(roomTypeId);
        if (request.endDate().isBefore(request.startDate())) {
            throw new ValidationException(
                    "endDate must be on or after startDate", Map.of("endDate", "must be >= startDate"));
        }
        int total = request.totalRooms();
        int avail = request.availableRooms() != null ? Math.min(request.availableRooms(), total) : total;

        List<AvailabilityNightDto> result = new ArrayList<>();
        for (LocalDate date = request.startDate(); !date.isAfter(request.endDate()); date = date.plusDays(1)) {
            RoomTypeAvailability row = availability.findByRoomTypeIdAndDate(roomTypeId, date).orElse(null);
            if (row == null) {
                row = new RoomTypeAvailability();
                row.setRoomTypeId(roomTypeId);
                row.setDate(date);
            }
            row.setTotalRooms(total);
            row.setAvailableRooms(avail);
            row.setPriceOverride(request.priceOverride());
            availability.save(row);
            result.add(new AvailabilityNightDto(date, total, avail, request.priceOverride()));
        }
        return result;
    }

    private List<RoomTypeOffer> buildOffers(List<RoomType> types, LocalDate checkIn, LocalDate checkOut) {
        Map<UUID, Map<LocalDate, RoomTypeAvailability>> nights =
                loadAvailability(types.stream().map(RoomType::getId).toList(), checkIn, checkOut);
        return buildOffersWithNights(types, checkIn, checkOut, nights);
    }

    private List<RoomTypeOffer> buildOffersWithNights(
            List<RoomType> types,
            LocalDate checkIn,
            LocalDate checkOut,
            Map<UUID, Map<LocalDate, RoomTypeAvailability>> nights) {
        long nightCount = ChronoUnit.DAYS.between(checkIn, checkOut);
        List<RoomTypeOffer> offers = new ArrayList<>();
        for (RoomType type : types) {
            Map<LocalDate, RoomTypeAvailability> byDate = nights.getOrDefault(type.getId(), Map.of());
            BigDecimal total = BigDecimal.ZERO;
            int minAvailable = Integer.MAX_VALUE;
            for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
                RoomTypeAvailability row = byDate.get(date);
                BigDecimal nightly = (row != null && row.getPriceOverride() != null)
                        ? row.getPriceOverride()
                        : type.getBasePricePerNight();
                total = total.add(nightly);
                minAvailable = Math.min(minAvailable, row != null ? row.getAvailableRooms() : 0);
            }
            int available = (nightCount == 0 || minAvailable == Integer.MAX_VALUE) ? 0 : minAvailable;
            offers.add(new RoomTypeOffer(
                    type.getId(),
                    type.getName(),
                    type.getDescription(),
                    type.getCapacity(),
                    type.getCurrency(),
                    scale(type.getBasePricePerNight()),
                    scale(total),
                    available,
                    List.copyOf(type.getAmenities())));
        }
        return offers;
    }

    private Map<UUID, Map<LocalDate, RoomTypeAvailability>> loadAvailability(
            Collection<UUID> roomTypeIds, LocalDate checkIn, LocalDate checkOut) {
        if (roomTypeIds.isEmpty()) {
            return Map.of();
        }
        Map<UUID, Map<LocalDate, RoomTypeAvailability>> map = new HashMap<>();
        for (RoomTypeAvailability row : availability.findNightsForRoomTypes(roomTypeIds, checkIn, checkOut)) {
            map.computeIfAbsent(row.getRoomTypeId(), k -> new HashMap<>()).put(row.getDate(), row);
        }
        return map;
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
