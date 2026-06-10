# SkyScout (flights) contract

Product: **SkyScout** — flight search & booking. Backend stack: **Node + TypeScript + Express +
PostgreSQL (Drizzle ORM)**. Published port: **4001**.

> Production-grade REST API (this replaces the old mock `POST /search_flights`). Base path `/api`.
> Success responses use `{ data, meta? }`; errors use `{ error: { code, message, details?, requestId } }`.
> Money is a 2-decimal **string** with an ISO `currency`. Authenticated routes use a **JWT bearer** token.
> Interactive docs live at **`/docs`** (raw spec at **`/openapi.json`**) and are the source of truth for
> exact shapes. Business logic is in a transport-agnostic service layer (A2A-ready). This backend does NOT
> call any other backend.

## Auth (JWT bearer)
- `POST /api/auth/register` `{ email, password }` → 201 `{ token, user }`
- `POST /api/auth/login` `{ email, password }` → 200 `{ token, user }`
- `GET /api/auth/me` (bearer) → 200 user

Send `Authorization: Bearer <token>` on authenticated routes. Login returns a generic `401 invalid
credentials` for both wrong password and unknown email (no email-existence leak).

## Flights
Public:
- `POST /api/flights/search` — `{ origin, destination, departureDate, returnDate?, passengers:{adults,
  children,infants}, cabin?, filters?, sortBy?, order?, page?, pageSize? }` → `{ outbound:{data:FlightSummary[],
  meta}, inbound? }`. No results → 200 with empty `data`.
- `GET /api/flights/:id` → FlightSummary (404 if absent/soft-deleted).

Admin (bearer + ADMIN role):
- `POST /api/flights` — create a flight + its cabin inventory (one transaction).
- `PATCH /api/flights/:id` — update schedule/status (status `CANCELLED` is NOT allowed here).
- `PATCH /api/flights/:id/status` — set status; `CANCELLED` **cascades** (active bookings cancelled +
  seats released).
- `DELETE /api/flights/:id` — 409 if active bookings exist, else soft-delete (`deletedAt`).

## Bookings (bearer)
- `POST /api/bookings` — create a booking; supports an `Idempotency-Key` header (replay returns the
  original booking). The critical transactional path: row-locked seat decrement (no overbooking ever),
  then a mock payment → `CONFIRMED`, or `402` + `FAILED` + seats released. 201 (or 200 on replay).
- `GET /api/bookings` — list own bookings (admin: all), paginated.
- `GET /api/bookings/:reference` — fetch by PNR (owner or admin; otherwise 404).
- `POST /api/bookings/:reference/cancel` — release seats; double-cancel is idempotent (200); past the
  configurable cancellation cutoff → 409; flight already departed → 409.

## Reference data (airports + airlines)
- `GET /api/airports`, `GET /api/airports/:id` (public); `POST`/`PATCH`/`DELETE` (admin).
- `GET /api/airlines`, `GET /api/airlines/:id` (public); `POST`/`PATCH`/`DELETE` (admin).
- IATA codes are stored uppercase; duplicate → 409; deleting a code still referenced by a flight → 409.

## Data shapes (full schemas at `/openapi.json`)
- **FlightSummary** `{ id, flightNumber, airline{iataCode,name}, origin{iataCode,city,timezone},
  destination{…}, scheduledDeparture, scheduledArrival, durationMinutes, status, cabins:CabinAvailability[] }`
- **CabinAvailability** `{ cabin (ECONOMY|BUSINESS|FIRST), basePrice (string), currency, availableSeats, totalSeats }`
- **Booking** `{ id, reference (PNR), status (PENDING|CONFIRMED|CANCELLED|FAILED), flightId, cabin,
  totalPrice (string), currency, contactEmail, passengers[], createdAt, updatedAt, cancelledAt }`
- **Airport** `{ id, iataCode, name, city, country, timezone }` · **Airline** `{ id, iataCode, name }`

## Ops
- `GET /health` (liveness) · `GET /ready` (DB ping; 503 if down) · `GET /docs` (Swagger UI) · `GET /openapi.json`

## Notes
- Seeded dev accounts: `admin@skyscout.dev` / `admin12345` (ADMIN), `user@skyscout.dev` / `user12345` (USER).
- The React frontend is **pending rebuild** against this REST API; the old mock `/search_flights` shape is retired.
