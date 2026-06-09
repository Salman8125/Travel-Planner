# Weathervane (weather) contract

Product: **Weathervane** — weather forecast. Backend stack: **Go (standard library)**. Published port: **4004**.

> Language-neutral contract. Returns a **plain array** — NO streaming/SSE (that is an
> A2A-phase concern). NO shared code package; does NOT call any other backend.

## Data shapes

### DailyForecast
| field     | type             | notes                                  |
|-----------|------------------|----------------------------------------|
| date      | string (YYYY-MM-DD) | e.g. `"2026-07-01"`                 |
| high      | number           | high temperature, **°C**               |
| low       | number           | low temperature, **°C**                |
| condition | string           | e.g. `"Sunny"`, `"Cloudy"`, `"Rain"`   |

## Endpoints

### POST /get_forecast
Return a multi-day forecast for a city.

Request body:
```json
{ "city": "London", "days": 5 }
```
`city` optional (case-insensitive; omitted = a default city). `days` optional, default `5`,
clamped to the available mock range.

Response: `DailyForecast[]`
```json
[
  { "date": "2026-07-01", "high": 24.0, "low": 15.0, "condition": "Sunny" },
  { "date": "2026-07-02", "high": 21.0, "low": 14.0, "condition": "Cloudy" }
]
```

## CORS
Permissive (dev only): allow any origin, methods `POST, OPTIONS`, header `Content-Type`.
