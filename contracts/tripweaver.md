# TripWeaver (itinerary) contract

Product: **TripWeaver** — itinerary builder. Backend stack: **C# / ASP.NET (minimal API)**. Published port: **4005**.

> Language-neutral contract. Responds **synchronously** — NO long-running task / polling
> (that is an A2A-phase concern). The itinerary backend COMPOSES data the caller passes in;
> it does NOT call the flight/hotel/weather/budget backends itself. NO shared code package.

## Data shapes (inputs mirror the other domains' shapes)

The request bundles one selected flight, one hotel, a weather forecast, and a budget status.
These mirror `FlightOption`, `HotelOption`, `DailyForecast[]`, and `BudgetStatus` from the
other contracts — but are passed in the request body (no backend-to-backend calls).

### Itinerary (response)
| field         | type            | notes                                              |
|---------------|-----------------|----------------------------------------------------|
| destination   | string          | derived from the flight's destination              |
| flight        | FlightOption    | echoed back                                        |
| hotel         | HotelOption     | echoed back                                        |
| forecast      | DailyForecast[] | echoed back                                        |
| estimatedCost | number          | `flight.price + hotel.totalPrice`                  |
| withinBudget  | boolean         | `estimatedCost <= budget.remaining`                |
| summary       | string          | human-readable one-line summary                    |

## Endpoints

### POST /build_itinerary
Compose a single itinerary object from the four inputs.

Request body:
```json
{
  "flight":   { "flightId": "FL-1001", "airline": "Skyline Airways", "origin": "JFK", "destination": "LHR", "departureTime": "2026-07-01T08:30:00Z", "arrivalTime": "2026-07-01T20:15:00Z", "price": 742.0, "stops": 0 },
  "hotel":    { "hotelId": "HT-2001", "name": "The Thames View", "starRating": 4, "pricePerNight": 180.0, "totalPrice": 540.0, "amenities": ["WiFi","Breakfast"] },
  "forecast": [ { "date": "2026-07-01", "high": 24.0, "low": 15.0, "condition": "Sunny" } ],
  "budget":   { "totalBudget": 5000.0, "spent": 1200.0, "remaining": 3800.0 }
}
```

Response: `Itinerary`
```json
{
  "destination": "LHR",
  "flight": { "...": "echoed FlightOption" },
  "hotel": { "...": "echoed HotelOption" },
  "forecast": [ { "...": "echoed DailyForecast" } ],
  "estimatedCost": 1282.0,
  "withinBudget": true,
  "summary": "Trip to LHR on Skyline Airways, staying at The Thames View. Estimated $1282.00 (within budget)."
}
```

## CORS
Permissive (dev only): allow any origin, methods `POST, OPTIONS`, header `Content-Type`.
