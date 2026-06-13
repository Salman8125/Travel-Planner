package com.travelplanner.roost.hotel;

import com.travelplanner.roost.hotel.dto.HotelDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HotelMapper {

    HotelDto toDto(Hotel hotel);
}
