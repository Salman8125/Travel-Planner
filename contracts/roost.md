# Roost (hotels) contract

Product: **Roost** — hotel search & booking. Backend stack: **Java 21 + Spring Boot 3 + PostgreSQL**.
Published port: **4002** (compose maps `4002:8080`; the Spring app binds `:8080` in-container).
Base path: `/api`. Money is `BigDecimal` (NUMERIC); nights are `LocalDate`.

> Production REST API (was a stdlib mock with `POST /search_hotels`). Public reads are open; bookings
> require auth; admin writes require an ADMIN JWT. Business logic lives in a transport-agnostic
> @Service layer (A2A-wrap-ready). Does NOT call any other backend.

## Envelopes
- Success: `{ "data": ... }`. Lists add `meta`: `{ "data": [...], "meta": { page, pageSize, total, totalPages } }`.
- Error (all failures): `{ "error": { "code", "message", "details"?, "requestId" } }` + an `X-Request-Id` header.
  Codes → status: `validation_error`(400), `unauthorized`(401), `forbidden`(403), `not_found`(404),
  `conflict`(409), `throttled`(429), `payment_failed`(402), `internal_error`(500).

## Data shapes
- **HotelSearchItem**: `{ hotelId, name, description, city, country, starRating, timezone, amenities[],
  currency, pricePerNight, totalPrice, roomTypes[] }` — `roomTypes` are bookable `RoomTypeOffer`s.
- **RoomTypeOffer**: `{ roomTypeId, name, description, capacity, currency, pricePerNight, totalPrice,
  availableRooms, amenities[] }` — priced + availability-checked for the requested range.
- **Booking**: `{ id, reference (6-char), userId, hotelId, roomTypeId, checkInDate, checkOutDate,
  numberOfRooms, numberOfGuests, status (PENDING|CONFIRMED|CANCELLED), totalPrice, currency,
  contactEmail, createdAt, cancelledAt?, guests[] }`.

## Inventory & concurrency
Availability is **per room type per night** (`RoomTypeAvailability(roomTypeId, date, totalRooms,
availableRooms, priceOverride?)`). A booking for `checkIn..checkOut` covers the nights
`checkIn..checkOut-1`. Booking N rooms locks every nightly row (`PESSIMISTIC_WRITE`, ordered by date)
in one transaction, verifies each has `availableRooms ≥ N`, decrements each, then writes the booking —
atomically. Two concurrent bookings for the last room on an overlapping night: exactly one succeeds,
the other gets `409` naming the unavailable night(s); no night is ever oversold.

## Endpoints (under `/api`)
**Public**
- `POST /api/hotels/search` — body `{ city, country?, checkInDate, checkOutDate, guests, rooms?,
  starRating?, priceMin?, priceMax?, amenities?[], sortBy(price|starRating)?, order?, page?, pageSize? }`
  → `{data: HotelSearchItem[], meta}` of hotels available for the FULL range. No match → `200 {data:[]}`.
- `GET /api/hotels/:id?checkInDate=&checkOutDate=` → `{data: { hotel, roomTypes[], availability? }}`
  (availability present only when dates are supplied). 404 if absent.
- `GET /api/hotels/:id/rooms?checkInDate=&checkOutDate=&guests=` → `{data: RoomTypeOffer[]}`.

**Bookings (Bearer token)**
- `POST /api/bookings` — body `{ roomTypeId, checkInDate, checkOutDate, numberOfRooms, guests[],
  contactEmail, currency? }`; supports an `Idempotency-Key` header (replay returns the original).
  Mock payment: contact email containing `decline` → `402 payment_failed` + inventory released.
- `GET /api/bookings/:reference` (owner or admin) · `GET /api/bookings` (own; admin lists all; paginated).
- `POST /api/bookings/:reference/cancel` — releases each night's inventory; free until N days before
  check-in (configurable), else `409`; cancelling an already-cancelled booking is idempotent.

**Admin (ADMIN Bearer token)**
- `POST /api/hotels`, `PATCH /api/hotels/:id`, `DELETE /api/hotels/:id` (blocked by FK if it has bookings).
- `POST /api/hotels/:id/room-types`, `PATCH /api/room-types/:id`, `DELETE /api/room-types/:id`.
- `PUT /api/room-types/:id/availability` — idempotent UPSERT of nightly inventory + pricing across a span.

**Auth** — `POST /api/auth/register {email,password}` → 201 `{data:{token,user}}`;
`POST /api/auth/login` → 200 `{data:{token,user}}` (generic 401, no email-existence leak);
`GET /api/auth/me` (Bearer) → `{data: user}`. Role ∈ {USER, ADMIN}.

**Ops** — `GET /actuator/health` (+ liveness/readiness groups) for probes; `GET /docs` Swagger UI;
`GET /v3/api-docs` OpenAPI JSON.

## Validation & rules
`checkIn < checkOut`; `checkIn` not in the past (hotel's IANA timezone); stay ≤ 30 nights; rooms 1..10;
`guests ≤ capacity × rooms`; booking currency must equal the room type's currency. Per-night/total price
= Σ over nights of `priceOverride ?? basePricePerNight`. Unique violations (duplicate email, confirmation
code, `(city,name)`, `(hotelId,name)`, `(roomTypeId,date)`) map to clean `409`s.

## Seeded accounts
`admin@roost.dev` / `admin12345` (ADMIN) · `user@roost.dev` / `user12345` (USER).
8 seeded hotels (Istanbul, Islamabad, Lahore, Dubai, Doha, London, Paris, New York) with IANA
timezones, 2 room types each, and 30 days of nightly availability + pricing.

## CORS
Allows the configured origins (or any origin in dev); methods `GET, POST, PATCH, PUT, DELETE, OPTIONS`;
headers `Authorization, Content-Type, Idempotency-Key, X-Request-Id`.
