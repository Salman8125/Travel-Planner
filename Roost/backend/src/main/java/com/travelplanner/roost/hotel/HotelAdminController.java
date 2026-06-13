package com.travelplanner.roost.hotel;

import com.travelplanner.roost.common.web.ApiEnvelope;
import com.travelplanner.roost.hotel.dto.CreateHotelRequest;
import com.travelplanner.roost.hotel.dto.HotelDto;
import com.travelplanner.roost.hotel.dto.UpdateHotelRequest;
import com.travelplanner.roost.room.dto.CreateRoomTypeRequest;
import com.travelplanner.roost.room.dto.RoomTypeDto;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hotels")
public class HotelAdminController {

    private final HotelService hotelService;

    public HotelAdminController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiEnvelope<HotelDto> create(@Valid @RequestBody CreateHotelRequest request) {
        return ApiEnvelope.of(hotelService.createHotel(request));
    }

    @PatchMapping("/{id}")
    public ApiEnvelope<HotelDto> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateHotelRequest request) {
        return ApiEnvelope.of(hotelService.updateHotel(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        hotelService.deleteHotel(id);
    }

    @PostMapping("/{id}/room-types")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiEnvelope<RoomTypeDto> createRoomType(
            @PathVariable UUID id, @Valid @RequestBody CreateRoomTypeRequest request) {
        return ApiEnvelope.of(hotelService.createRoomType(id, request));
    }
}
