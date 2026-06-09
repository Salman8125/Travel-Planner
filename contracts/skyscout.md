# SkyScout (flights) contract

Product: **SkyScout** — flight search. Backend stack: **Node + TypeScript**. Published port: **4001**.

> Language-neutral contract. The SkyScout backend implements its OWN native types from the
> shapes below. There is NO shared code package. This backend does NOT import or call any
> other backend.

## Data shapes

### FlightOption
| field         | type              | notes                                    |
|---------------|-------------------|------------------------------------------|
| flightId      | string            | unique id, e.g. `"FL-1001"`              |
| airline       | string            | e.g. `"Skyline Airways"`                 |
| origin        | string            | IATA 3-letter code, e.g. `"JFK"`         |
| destination   | string            | IATA 3-letter code, e.g. `"LHR"`         |
| departureTime | string (ISO-8601) | e.g. `"2026-07-01T08:30:00Z"`            |
| arrivalTime   | string (ISO-8601) | e.g. `"2026-07-01T20:15:00Z"`            |
| price         | number            | total price in USD                       |
| stops         | integer           | number of stops (0 = direct)             |

## Endpoints

### POST /search_flights
Search available flights between two airports.

Request body:
```json
{ "origin": "JFK", "destination": "LHR" }
```
Both fields optional; when omitted, all mock flights are returned. Matching is
case-insensitive on the IATA code.

Response: `FlightOption[]`
```json
[
  {
    "flightId": "FL-1001",
    "airline": "Skyline Airways",
    "origin": "JFK",
    "destination": "LHR",
    "departureTime": "2026-07-01T08:30:00Z",
    "arrivalTime": "2026-07-01T20:15:00Z",
    "price": 742.0,
    "stops": 0
  }
]
```

### POST /get_flight_details
Return the single flight matching a `flightId` (still typed as `FlightOption[]` — an array
with 0 or 1 element — to keep the skill return type uniform).

Request body:
```json
{ "flightId": "FL-1001" }
```

Response: `FlightOption[]` (empty array if not found).

## CORS
Permissive (dev only): allow any origin, methods `POST, OPTIONS`, header `Content-Type`.
