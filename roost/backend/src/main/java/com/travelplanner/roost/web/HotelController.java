package com.travelplanner.roost.web;

import com.travelplanner.roost.domain.HotelOption;
import com.travelplanner.roost.domain.HotelService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

// HTTP layer — thin controller. One POST endpoint per skill: parse body -> call domain -> JSON.
@RestController
public class HotelController {

    private final HotelService service = new HotelService();

    // skill: search_hotels -> HotelOption[]
    @PostMapping("/search_hotels")
    public List<HotelOption> searchHotels(@RequestBody(required = false) Map<String, Object> body) {
        String city = strOrNull(body, "city");
        Integer nights = intOrNull(body, "nights");
        return service.searchHotels(city, nights);
    }

    // skill: get_hotel_details -> HotelOption[] (0 or 1 element)
    @PostMapping("/get_hotel_details")
    public List<HotelOption> getHotelDetails(@RequestBody(required = false) Map<String, Object> body) {
        return service.getHotelDetails(strOrNull(body, "hotelId"));
    }

    @org.springframework.web.bind.annotation.GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    private static String strOrNull(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object v = body.get(key);
        return v == null ? null : v.toString();
    }

    private static Integer intOrNull(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object v = body.get(key);
        if (v instanceof Number n) return n.intValue();
        if (v == null) return null;
        try { return Integer.parseInt(v.toString()); } catch (NumberFormatException e) { return null; }
    }
}
