package com.travelplanner.roost.hotel;

import com.travelplanner.roost.common.web.ApiEnvelope;
import com.travelplanner.roost.common.web.ListEnvelope;
import com.travelplanner.roost.hotel.dto.HotelDetailDto;
import com.travelplanner.roost.hotel.dto.HotelSearchItem;
import com.travelplanner.roost.hotel.dto.HotelSearchRequest;
import com.travelplanner.roost.hotel.dto.HotelSearchResult;
import com.travelplanner.roost.room.dto.RoomTypeOffer;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @PostMapping("/search")
    public ListEnvelope<HotelSearchItem> search(@Valid @RequestBody HotelSearchRequest request) {
        HotelSearchResult result = hotelService.search(request);
        return ListEnvelope.of(result.items(), result.meta());
    }

    @GetMapping("/{id}")
    public ApiEnvelope<HotelDetailDto> detail(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        return ApiEnvelope.of(hotelService.getDetail(id, checkInDate, checkOutDate));
    }

    @GetMapping("/{id}/rooms")
    public ApiEnvelope<List<RoomTypeOffer>> rooms(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false) Integer guests) {
        return ApiEnvelope.of(hotelService.getRooms(id, checkInDate, checkOutDate, guests));
    }
}
