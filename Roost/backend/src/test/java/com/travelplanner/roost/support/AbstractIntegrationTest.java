package com.travelplanner.roost.support;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
    }

    @DynamicPropertySource
    static void datasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    protected TestRestTemplate rest;

    @LocalServerPort
    protected int port;

    protected String url(String path) {
        return "http://localhost:" + port + path;
    }

    protected String adminToken() {
        return token("admin@roost.dev", "admin12345");
    }

    protected String userToken() {
        return token("user@roost.dev", "user12345");
    }

    protected String token(String email, String password) {
        ResponseEntity<JsonNode> response = postJson(
                "/api/auth/login", Map.of("email", email, "password", password), null);
        return response.getBody().path("data").path("token").asText();
    }

    protected HttpHeaders headers(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (token != null) {
            headers.setBearerAuth(token);
        }
        return headers;
    }

    protected ResponseEntity<JsonNode> postJson(String path, Object body, String token) {
        return rest.exchange(
                url(path), HttpMethod.POST, new HttpEntity<>(body, headers(token)), JsonNode.class);
    }

    protected ResponseEntity<JsonNode> postJson(String path, Object body, String token, HttpHeaders extra) {
        HttpHeaders headers = headers(token);
        headers.addAll(extra);
        return rest.exchange(url(path), HttpMethod.POST, new HttpEntity<>(body, headers), JsonNode.class);
    }

    protected ResponseEntity<JsonNode> getJson(String path, String token) {
        return rest.exchange(url(path), HttpMethod.GET, new HttpEntity<>(headers(token)), JsonNode.class);
    }

    protected ResponseEntity<JsonNode> putJson(String path, Object body, String token) {
        return rest.exchange(
                url(path), HttpMethod.PUT, new HttpEntity<>(body, headers(token)), JsonNode.class);
    }

    public record Inventory(String hotelId, String roomTypeId) {}

    protected Inventory createInventory(
            String adminToken, int totalRooms, int capacity, LocalDate checkIn, LocalDate checkOut) {
        Map<String, Object> hotelBody = Map.of(
                "name", "IT Hotel " + UUID.randomUUID(),
                "city", "Testville",
                "country", "TR",
                "starRating", 4,
                "latitude", 0.0,
                "longitude", 0.0,
                "timezone", "UTC",
                "amenities", List.of("WiFi"));
        String hotelId = postJson("/api/hotels", hotelBody, adminToken).getBody().path("data").path("id").asText();

        Map<String, Object> roomBody = Map.of(
                "name", "Standard",
                "capacity", capacity,
                "basePricePerNight", 100.00,
                "currency", "USD",
                "amenities", List.of("WiFi"));
        String roomTypeId = postJson("/api/hotels/" + hotelId + "/room-types", roomBody, adminToken)
                .getBody().path("data").path("id").asText();

        Map<String, Object> availability = Map.of(
                "startDate", checkIn.toString(),
                "endDate", checkOut.minusDays(1).toString(),
                "totalRooms", totalRooms,
                "availableRooms", totalRooms);
        putJson("/api/room-types/" + roomTypeId + "/availability", availability, adminToken);
        return new Inventory(hotelId, roomTypeId);
    }

    protected Map<String, Object> bookingBody(
            String roomTypeId, LocalDate checkIn, LocalDate checkOut, int rooms, String contactEmail) {
        return Map.of(
                "roomTypeId", roomTypeId,
                "checkInDate", checkIn.toString(),
                "checkOutDate", checkOut.toString(),
                "numberOfRooms", rooms,
                "guests", List.of(Map.of("firstName", "Test", "lastName", "Guest")),
                "contactEmail", contactEmail);
    }
}
