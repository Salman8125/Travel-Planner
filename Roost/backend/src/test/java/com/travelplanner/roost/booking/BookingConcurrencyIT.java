package com.travelplanner.roost.booking;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.travelplanner.roost.room.RoomTypeAvailabilityRepository;
import com.travelplanner.roost.support.AbstractIntegrationTest;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class BookingConcurrencyIT extends AbstractIntegrationTest {

    @Autowired
    RoomTypeAvailabilityRepository availability;

    @Test
    void onlyOneBookingWinsTheLastRoomOnAnOverlappingNight() throws Exception {
        String admin = adminToken();
        String user = userToken();
        LocalDate checkIn = LocalDate.now(ZoneOffset.UTC).plusDays(2);
        LocalDate checkOut = checkIn.plusDays(1);

        Inventory inv = createInventory(admin, 1, 2, checkIn, checkOut);

        int threads = 8;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch go = new CountDownLatch(1);
        AtomicInteger created = new AtomicInteger();
        AtomicInteger conflicts = new AtomicInteger();
        AtomicInteger other = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    go.await();
                    ResponseEntity<JsonNode> response = postJson(
                            "/api/bookings",
                            bookingBody(inv.roomTypeId(), checkIn, checkOut, 1, "guest@roost.test"),
                            user);
                    if (response.getStatusCode() == HttpStatus.CREATED) {
                        created.incrementAndGet();
                    } else if (response.getStatusCode() == HttpStatus.CONFLICT) {
                        conflicts.incrementAndGet();
                    } else {
                        other.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        ready.await(10, TimeUnit.SECONDS);
        go.countDown();
        pool.shutdown();
        assertThat(pool.awaitTermination(30, TimeUnit.SECONDS)).isTrue();

        assertThat(created.get()).as("exactly one booking confirmed").isEqualTo(1);
        assertThat(conflicts.get()).as("the rest are 409").isEqualTo(threads - 1);
        assertThat(other.get()).as("no unexpected statuses").isZero();

        int remaining = availability
                .findByRoomTypeIdAndDate(UUID.fromString(inv.roomTypeId()), checkIn)
                .orElseThrow()
                .getAvailableRooms();
        assertThat(remaining).as("night is never oversold").isEqualTo(0);
    }
}
