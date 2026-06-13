package com.travelplanner.roost.room;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.travelplanner.roost.room.dto.RoomTypeOffer;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock RoomTypeRepository roomTypes;
    @Mock RoomTypeAvailabilityRepository availability;
    @Mock RoomTypeMapper mapper;

    RoomService service;
    UUID roomTypeId;

    @BeforeEach
    void setUp() {
        service = new RoomService(roomTypes, availability, mapper);
        roomTypeId = UUID.randomUUID();
    }

    @Test
    void offerSumsNightlyPriceUsingOverridesAndTakesMinAvailability() {
        UUID hotelId = UUID.randomUUID();
        RoomType roomType = new RoomType();
        ReflectionTestUtils.setField(roomType, "id", roomTypeId);
        roomType.setHotelId(hotelId);
        roomType.setName("Standard");
        roomType.setCapacity(2);
        roomType.setBasePricePerNight(new BigDecimal("100.00"));
        roomType.setCurrency("USD");

        LocalDate in = LocalDate.of(2026, 7, 1);
        LocalDate out = LocalDate.of(2026, 7, 3);

        RoomTypeAvailability n1 = night(in, 5, null);
        RoomTypeAvailability n2 = night(in.plusDays(1), 3, new BigDecimal("120.00"));

        when(roomTypes.findByHotelId(hotelId)).thenReturn(List.of(roomType));
        when(availability.findNightsForRoomTypes(any(), any(), any())).thenReturn(List.of(n1, n2));

        List<RoomTypeOffer> offers = service.offersForHotel(hotelId, in, out);

        assertThat(offers).hasSize(1);
        RoomTypeOffer offer = offers.get(0);
        assertThat(offer.totalPrice()).isEqualByComparingTo("220.00");
        assertThat(offer.pricePerNight()).isEqualByComparingTo("100.00");
        assertThat(offer.availableRooms()).isEqualTo(3);
    }

    @Test
    void missingNightMakesRoomTypeUnavailable() {
        UUID hotelId = UUID.randomUUID();
        RoomType roomType = new RoomType();
        ReflectionTestUtils.setField(roomType, "id", roomTypeId);
        roomType.setHotelId(hotelId);
        roomType.setName("Standard");
        roomType.setCapacity(2);
        roomType.setBasePricePerNight(new BigDecimal("100.00"));
        roomType.setCurrency("USD");

        LocalDate in = LocalDate.of(2026, 7, 1);
        LocalDate out = LocalDate.of(2026, 7, 3);

        when(roomTypes.findByHotelId(hotelId)).thenReturn(List.of(roomType));
        when(availability.findNightsForRoomTypes(any(), any(), any()))
                .thenReturn(List.of(night(in, 5, null)));

        List<RoomTypeOffer> offers = service.offersForHotel(hotelId, in, out);
        assertThat(offers.get(0).availableRooms()).isZero();
    }

    private RoomTypeAvailability night(LocalDate date, int available, BigDecimal override) {
        RoomTypeAvailability a = new RoomTypeAvailability();
        a.setRoomTypeId(roomTypeId);
        a.setDate(date);
        a.setTotalRooms(Math.max(available, 5));
        a.setAvailableRooms(available);
        a.setPriceOverride(override);
        return a;
    }
}
