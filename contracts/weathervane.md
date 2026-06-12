# Weathervane (weather) contract

Product: **Weathervane** — weather forecast. Backend stack: **Go (chi) + PostgreSQL**.
Published port: **4004** (gunicorn-equivalent: the Go service binds `:8080` in-container; compose maps `4004:8080`).
Base path: `/api`. Times are UTC / ISO-8601; temperatures are °C.

> Production REST API (was a stdlib mock with `POST /get_forecast`). Public reads are open;
> admin writes require an ADMIN JWT. Does NOT call any other backend. SSE streaming is a
> documented A2A-phase concern — `GET /api/forecast/stream` returns `501 not_implemented`.

## Envelopes
- Success: `{ "data": ... }`. Lists add `meta`: `{ "data": [...], "meta": { page, pageSize, total, totalPages } }`.
- Error (all failures): `{ "error": { "code", "message", "details"?, "requestId" } }` + an `X-Request-Id` response header.
  Codes → status: `validation_error`(400), `unauthorized`(401), `forbidden`(403), `not_found`(404),
  `conflict`(409), `throttled`(429), `internal_error`(500).

## Data shapes

### DailyForecast
| field               | type               | notes                          |
|---------------------|--------------------|--------------------------------|
| date                | string (YYYY-MM-DD) | `"2026-07-01"`                |
| high                | number (°C)        | high temperature               |
| low                 | number (°C)        | low temperature                |
| condition           | string (enum)      | `SUNNY, CLOUDY, PARTLY_CLOUDY, RAINY, SNOWY, WINDY, FOGGY, STORMY` |
| precipitationChance | int 0–100, optional |                               |
| humidity            | int 0–100, optional |                               |
| windKph             | number, optional   |                                |

### Location
`{ id (uuid), name, city, country, latitude, longitude, timezone (IANA), createdAt, updatedAt }`.

### CurrentWeather
`{ locationId, tempC, condition, humidity?, windKph?, observedAt }`.

## Endpoints (all under `/api`)
**Public (no auth)**
- `GET /api/locations?q=&country=&page=&pageSize=` → paginated `{data,meta}`.
- `GET /api/locations/:id` → `{data: Location}` (404 if absent).
- `GET /api/forecast?locationId=&startDate=&endDate=` (or `?city=&country=`) → `{data: DailyForecast[]}`.
  startDate ≤ endDate; span capped at 16 days (400 if exceeded); empty range → `200 {data:[]}`;
  unknown location → 404; `?city=` matching multiple → 409 (specify `country`).
- `GET /api/weather/current?locationId=` (or `?city=`) → `{data: CurrentWeather}`.

**Auth** — `POST /api/auth/register {email,password}` → 201 `{data:{token,user}}`;
`POST /api/auth/login` → 200 `{data:{token,user}}` (generic 401, no email-existence leak);
`GET /api/auth/me` (Bearer) → `{data: user}`. Role ∈ {USER, ADMIN}.

**Admin (ADMIN Bearer token)** — `POST /api/locations`, `PATCH /api/locations/:id`,
`DELETE /api/locations/:id` (204); `PUT /api/locations/:id/forecast` (idempotent upsert on
(location_id, date)); `PUT /api/locations/:id/current`. 401 if no/invalid token, 403 for a USER token.

**Ops** — `GET /health` → `{status:"ok"}`; `GET /ready` → `{status:"ready",db:"up"}` or 503;
`GET /docs` (Swagger UI) · `GET /openapi.yaml` · `GET /metrics` (Prometheus). A request that exceeds
the server deadline (or is cancelled) returns 503 `timeout`.

## Seeded accounts
`admin@weathervane.dev` / `admin12345` (ADMIN) · `user@weathervane.dev` / `user12345` (USER).
~10 seeded locations (Istanbul, Islamabad, Lahore, Dubai, Doha, London, New York, Tokyo, Paris,
Sydney) with IANA timezones, 14 days of daily forecasts each + current weather.

## CORS
Allows any origin; methods `GET, POST, PATCH, PUT, DELETE, OPTIONS`; headers `Content-Type,
Authorization, X-Request-Id` (so the browser SPA can call it cross-origin).
