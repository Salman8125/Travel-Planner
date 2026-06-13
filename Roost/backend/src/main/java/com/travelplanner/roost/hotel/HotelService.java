package com.travelplanner.roost.hotel;

import com.travelplanner.roost.common.error.NotFoundException;
import com.travelplanner.roost.common.error.ValidationException;
import com.travelplanner.roost.common.web.PageMeta;
import com.travelplanner.roost.common.web.PageRequestFactory;
import com.travelplanner.roost.hotel.dto.CreateHotelRequest;
import com.travelplanner.roost.hotel.dto.HotelDetailDto;
import com.travelplanner.roost.hotel.dto.HotelDto;
import com.travelplanner.roost.hotel.dto.HotelSearchItem;
import com.travelplanner.roost.hotel.dto.HotelSearchRequest;
import com.travelplanner.roost.hotel.dto.HotelSearchResult;
import com.travelplanner.roost.hotel.dto.UpdateHotelRequest;
import com.travelplanner.roost.room.RoomService;
import com.travelplanner.roost.room.dto.CreateRoomTypeRequest;
import com.travelplanner.roost.room.dto.RoomTypeDto;
import com.travelplanner.roost.room.dto.RoomTypeOffer;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HotelService {

    private final HotelRepository hotels;
    private final RoomService roomService;
    private final HotelMapper mapper;

    public HotelService(HotelRepository hotels, RoomService roomService, HotelMapper mapper) {
        this.hotels = hotels;
        this.roomService = roomService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public HotelSearchResult search(HotelSearchRequest request) {
        validateRange(request.checkInDate(), request.checkOutDate());
        int rooms = request.rooms() == null ? 1 : request.rooms();
        int guests = request.guests();

        List<Hotel> candidates = hotels.findAll(
                HotelSpecifications.matching(request.city(), request.country(), request.starRating()));
        if (request.amenities() != null && !request.amenities().isEmpty()) {
            Set<String> required = new LinkedHashSet<>(request.amenities());
            candidates = candidates.stream()
                    .filter(h -> h.getAmenities().containsAll(required))
                    .toList();
        }
        if (candidates.isEmpty()) {
            return new HotelSearchResult(List.of(), PageMeta.of(
                    PageRequestFactory.clampPage(request.page()),
                    PageRequestFactory.clampPageSize(request.pageSize()),
                    0));
        }

        Map<UUID, List<RoomTypeOffer>> offersByHotel = roomService.offersForHotels(
                candidates.stream().map(Hotel::getId).toList(),
                request.checkInDate(),
                request.checkOutDate());

        List<HotelSearchItem> items = new java.util.ArrayList<>();
        for (Hotel hotel : candidates) {
            List<RoomTypeOffer> bookable = offersByHotel.getOrDefault(hotel.getId(), List.of()).stream()
                    .filter(o -> o.availableRooms() >= rooms)
                    .filter(o -> (long) o.capacity() * rooms >= guests)
                    .filter(o -> request.priceMin() == null || o.pricePerNight().compareTo(request.priceMin()) >= 0)
                    .filter(o -> request.priceMax() == null || o.pricePerNight().compareTo(request.priceMax()) <= 0)
                    .toList();
            if (bookable.isEmpty()) {
                continue;
            }
            RoomTypeOffer cheapest = bookable.stream()
                    .min(Comparator.comparing(RoomTypeOffer::totalPrice))
                    .orElseThrow();
            items.add(new HotelSearchItem(
                    hotel.getId(),
                    hotel.getName(),
                    hotel.getDescription(),
                    hotel.getCity(),
                    hotel.getCountry(),
                    hotel.getStarRating(),
                    hotel.getTimezone(),
                    List.copyOf(hotel.getAmenities()),
                    cheapest.currency(),
                    cheapest.pricePerNight(),
                    cheapest.totalPrice(),
                    bookable));
        }

        sort(items, request.sortBy(), request.order());
        return paginate(items, request.page(), request.pageSize());
    }

    @Transactional(readOnly = true)
    public HotelDetailDto getDetail(UUID hotelId, LocalDate checkIn, LocalDate checkOut) {
        Hotel hotel = getHotelOrThrow(hotelId);
        HotelDto dto = mapper.toDto(hotel);
        List<RoomTypeDto> roomTypes = roomService.roomTypesForHotel(hotelId);
        List<RoomTypeOffer> availability = null;
        if (checkIn != null || checkOut != null) {
            validateRange(checkIn, checkOut);
            availability = roomService.offersForHotel(hotelId, checkIn, checkOut);
        }
        return new HotelDetailDto(dto, roomTypes, availability);
    }

    @Transactional(readOnly = true)
    public List<RoomTypeOffer> getRooms(UUID hotelId, LocalDate checkIn, LocalDate checkOut, Integer guests) {
        getHotelOrThrow(hotelId);
        validateRange(checkIn, checkOut);
        List<RoomTypeOffer> offers = roomService.offersForHotel(hotelId, checkIn, checkOut);
        if (guests != null && guests > 0) {
            offers = offers.stream().filter(o -> o.capacity() >= guests).toList();
        }
        return offers;
    }

    @Transactional
    public HotelDto createHotel(CreateHotelRequest request) {
        Hotel hotel = new Hotel();
        applyCreate(hotel, request);
        hotels.save(hotel);
        return mapper.toDto(hotel);
    }

    @Transactional
    public HotelDto updateHotel(UUID hotelId, UpdateHotelRequest request) {
        Hotel hotel = getHotelOrThrow(hotelId);
        if (request.name() != null) {
            hotel.setName(request.name().trim());
        }
        if (request.description() != null) {
            hotel.setDescription(request.description());
        }
        if (request.city() != null) {
            hotel.setCity(request.city().trim());
        }
        if (request.country() != null) {
            hotel.setCountry(request.country().trim().toUpperCase());
        }
        if (request.address() != null) {
            hotel.setAddress(request.address());
        }
        if (request.starRating() != null) {
            hotel.setStarRating(request.starRating());
        }
        if (request.latitude() != null) {
            hotel.setLatitude(request.latitude());
        }
        if (request.longitude() != null) {
            hotel.setLongitude(request.longitude());
        }
        if (request.timezone() != null) {
            hotel.setTimezone(request.timezone().trim());
        }
        if (request.amenities() != null) {
            hotel.setAmenities(new LinkedHashSet<>(request.amenities()));
        }
        return mapper.toDto(hotel);
    }

    @Transactional
    public void deleteHotel(UUID hotelId) {
        hotels.delete(getHotelOrThrow(hotelId));
    }

    @Transactional
    public RoomTypeDto createRoomType(UUID hotelId, CreateRoomTypeRequest request) {
        getHotelOrThrow(hotelId);
        return roomService.createRoomType(hotelId, request);
    }

    private Hotel getHotelOrThrow(UUID hotelId) {
        return hotels.findById(hotelId).orElseThrow(() -> new NotFoundException("Hotel not found"));
    }

    private void applyCreate(Hotel hotel, CreateHotelRequest request) {
        hotel.setName(request.name().trim());
        hotel.setDescription(request.description());
        hotel.setCity(request.city().trim());
        hotel.setCountry(request.country().trim().toUpperCase());
        hotel.setAddress(request.address());
        hotel.setStarRating(request.starRating());
        hotel.setLatitude(request.latitude());
        hotel.setLongitude(request.longitude());
        hotel.setTimezone(request.timezone().trim());
        if (request.amenities() != null) {
            hotel.setAmenities(new LinkedHashSet<>(request.amenities()));
        }
    }

    private static void validateRange(LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new ValidationException("checkInDate and checkOutDate are required");
        }
        if (!checkIn.isBefore(checkOut)) {
            throw new ValidationException(
                    "checkInDate must be before checkOutDate",
                    Map.of("checkOutDate", "must be after checkInDate"));
        }
    }

    private static void sort(List<HotelSearchItem> items, String sortBy, String order) {
        Comparator<HotelSearchItem> comparator = "starRating".equalsIgnoreCase(sortBy)
                ? Comparator.comparingInt(HotelSearchItem::starRating)
                : Comparator.comparing(HotelSearchItem::totalPrice);
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }
        items.sort(comparator);
    }

    private static HotelSearchResult paginate(List<HotelSearchItem> items, Integer page, Integer pageSize) {
        int p = PageRequestFactory.clampPage(page);
        int size = PageRequestFactory.clampPageSize(pageSize);
        int from = Math.min((p - 1) * size, items.size());
        int to = Math.min(from + size, items.size());
        return new HotelSearchResult(items.subList(from, to), PageMeta.of(p, size, items.size()));
    }
}
