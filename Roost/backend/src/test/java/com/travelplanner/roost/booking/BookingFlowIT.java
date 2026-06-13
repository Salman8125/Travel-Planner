package com.travelplanner.roost.booking;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.travelplanner.roost.room.RoomTypeAvailabilityRepository;
import com.travelplanner.roost.support.AbstractIntegrationTest;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class BookingFlowIT extends AbstractIntegrationTest {

    @Autowired
    RoomTypeAvailabilityRepository availability;

    private LocalDate checkIn() {
        return LocalDate.now(ZoneOffset.UTC).plusDays(3);
    }

    private int remaining(String roomTypeId, LocalDate date) {
        return availability
                .findByRoomTypeIdAndDate(UUID.fromString(roomTypeId), date)
                .orElseThrow()
                .getAvailableRooms();
    }

    @Test
    void idempotencyReplayReturnsSameBookingAndDecrementsOnce() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = checkIn();
        LocalDate out = in.plusDays(2);
        Inventory inv = createInventory(admin, 2, 2, in, out);

        HttpHeaders key = new HttpHeaders();
        key.add("Idempotency-Key", "idem-123");

        ResponseEntity<JsonNode> first =
                postJson("/api/bookings", bookingBody(inv.roomTypeId(), in, out, 1, "g@roost.test"), user, key);
        ResponseEntity<JsonNode> second =
                postJson("/api/bookings", bookingBody(inv.roomTypeId(), in, out, 1, "g@roost.test"), user, key);

        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String ref1 = first.getBody().path("data").path("reference").asText();
        String ref2 = second.getBody().path("data").path("reference").asText();
        assertThat(ref2).isEqualTo(ref1);
        assertThat(remaining(inv.roomTypeId(), in)).isEqualTo(1);
    }

    @Test
    void partialAvailabilityRejectsTheWholeStay() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = checkIn();
        LocalDate mid = in.plusDays(1);
        LocalDate out = in.plusDays(2);
        Inventory inv = createInventory(admin, 2, 2, in, out);
        putJson(
                "/api/room-types/" + inv.roomTypeId() + "/availability",
                Map.of("startDate", mid.toString(), "endDate", mid.toString(), "totalRooms", 2, "availableRooms", 0),
                admin);

        ResponseEntity<JsonNode> response =
                postJson("/api/bookings", bookingBody(inv.roomTypeId(), in, out, 1, "g@roost.test"), user);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody().path("error").path("details").path("unavailableNights").asText())
                .contains(mid.toString());
        assertThat(remaining(inv.roomTypeId(), in)).as("first night untouched").isEqualTo(2);
    }

    @Test
    void currencyMismatchIsRejected() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = checkIn();
        LocalDate out = in.plusDays(1);
        Inventory inv = createInventory(admin, 2, 2, in, out);

        Map<String, Object> body = Map.of(
                "roomTypeId", inv.roomTypeId(),
                "checkInDate", in.toString(),
                "checkOutDate", out.toString(),
                "numberOfRooms", 1,
                "guests", java.util.List.of(Map.of("firstName", "A", "lastName", "B")),
                "contactEmail", "g@roost.test",
                "currency", "EUR");

        ResponseEntity<JsonNode> response = postJson("/api/bookings", body, user);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void cancelReleasesInventoryAndIsIdempotent() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = checkIn();
        LocalDate out = in.plusDays(1);
        Inventory inv = createInventory(admin, 3, 2, in, out);

        ResponseEntity<JsonNode> booked =
                postJson("/api/bookings", bookingBody(inv.roomTypeId(), in, out, 2, "g@roost.test"), user);
        assertThat(booked.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(remaining(inv.roomTypeId(), in)).isEqualTo(1);
        String reference = booked.getBody().path("data").path("reference").asText();

        ResponseEntity<JsonNode> cancelled =
                postJson("/api/bookings/" + reference + "/cancel", Map.of(), user);
        assertThat(cancelled.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cancelled.getBody().path("data").path("status").asText()).isEqualTo("CANCELLED");
        assertThat(remaining(inv.roomTypeId(), in)).as("inventory restored").isEqualTo(3);

        ResponseEntity<JsonNode> again = postJson("/api/bookings/" + reference + "/cancel", Map.of(), user);
        assertThat(again.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(remaining(inv.roomTypeId(), in)).isEqualTo(3);
    }

    @Test
    void cancellationWindowClosedReturnsConflict() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = LocalDate.now(ZoneOffset.UTC).plusDays(1);
        LocalDate out = in.plusDays(1);
        Inventory inv = createInventory(admin, 2, 2, in, out);

        String reference = postJson("/api/bookings", bookingBody(inv.roomTypeId(), in, out, 1, "g@roost.test"), user)
                .getBody().path("data").path("reference").asText();

        ResponseEntity<JsonNode> cancel = postJson("/api/bookings/" + reference + "/cancel", Map.of(), user);
        assertThat(cancel.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void stayLengthCapIsEnforced() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = checkIn();
        Inventory inv = createInventory(admin, 2, 2, in, in.plusDays(1));

        ResponseEntity<JsonNode> response = postJson(
                "/api/bookings", bookingBody(inv.roomTypeId(), in, in.plusDays(31), 1, "g@roost.test"), user);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void declinedPaymentReleasesInventory() {
        String admin = adminToken();
        String user = userToken();
        LocalDate in = checkIn();
        LocalDate out = in.plusDays(1);
        Inventory inv = createInventory(admin, 2, 2, in, out);

        ResponseEntity<JsonNode> response = postJson(
                "/api/bookings", bookingBody(inv.roomTypeId(), in, out, 1, "decline@roost.test"), user);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYMENT_REQUIRED);
        assertThat(response.getBody().path("error").path("code").asText()).isEqualTo("payment_failed");
        assertThat(remaining(inv.roomTypeId(), in)).as("inventory released after decline").isEqualTo(2);
    }
}
