package com.travelplanner.roost.booking;

import com.travelplanner.roost.booking.dto.BookingDto;
import com.travelplanner.roost.booking.dto.GuestDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    BookingDto toDto(Booking booking);

    GuestDto toDto(Guest guest);
}
