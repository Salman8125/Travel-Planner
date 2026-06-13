package com.travelplanner.roost.room;

import com.travelplanner.roost.room.dto.RoomTypeDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoomTypeMapper {

    RoomTypeDto toDto(RoomType roomType);
}
