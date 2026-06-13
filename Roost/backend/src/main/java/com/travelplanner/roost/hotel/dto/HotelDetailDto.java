package com.travelplanner.roost.hotel.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.travelplanner.roost.room.dto.RoomTypeDto;
import com.travelplanner.roost.room.dto.RoomTypeOffer;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record HotelDetailDto(
        HotelDto hotel,
        List<RoomTypeDto> roomTypes,
        List<RoomTypeOffer> availability) {}
