# Travel Planner — Polyglot Multi-Product Monorepo

Five **fully independent** products, each with its own frontend + backend written in a
deliberately different stack, proving the system is language-agnostic:

- ✈️ **SkyScout** — flight search
- 🏨 **Roost** — hotel search
- 💰 **PennyPilot** — budget tracking (Django + Postgres, per-user with login)
- 🌤️ **Weathervane** — weather forecast
- 🧳 **TripWeaver** — itinerary builder

In this phase the products do **not** talk to each other — there is no orchestrator, no shared
database, and no [A2A](https://github.com/google/A2A) protocol layer (a later phase adds A2A on
top of the backends). Each backend already separates a **pure domain layer** from a **thin HTTP
layer** so A2A can wrap the domain logic later without a rewrite.

The whole system is Dockerized: **`docker compose up --build`** starts all 10 services (plus a
Postgres database for PennyPilot — 11 containers in total).

## Products

| Product      | Domain    | Backend            | BE port | Frontend       | FE port | Frontend URL          |
|--------------|-----------|--------------------|---------|----------------|---------|-----------------------|
| **SkyScout**    | flights   | Node + TypeScript  | 4001    | React (Vite)   | 3001    | http://localhost:3001 |
| **Roost**       | hotels    | Java + Spring Boot | 4002    | Angular        | 3002    | http://localhost:3002 |
| **PennyPilot**  | budget    | Python + Django + Postgres | 4003 | Svelte (Vite) | 3003 | http://localhost:3003 |
| **Weathervane** | weather   | Go (stdlib)        | 4004    | Vue (Vite)     | 3004    | http://localhost:3004 |
| **TripWeaver**  | itinerary | C# / ASP.NET       | 4005    | SolidJS (Vite) | 3005    | http://localhost:3005 |

The language-neutral data shapes + endpoints are documented in [`/contracts`](./contracts)
(one file per product). Each backend implements its OWN native types from those contracts —
there is no shared code package across languages.

## Prerequisites

- **Docker** and **Docker Compose v2** (`docker compose version`). Nothing else is required —
  every toolchain (Node, Maven/JDK, Python, Go, .NET) runs inside its container.

## Run everything

```bash
docker compose up --build
```

This builds and starts everything (the 10 services + the PennyPilot Postgres database). Open any
frontend URL from the table above. Each
frontend calls **only its own backend** over plain REST at `http://localhost:<backendPort>`
(the published host port), cross-origin via CORS.

To stop: `Ctrl-C`, then `docker compose down`.

> **Networking note:** the browser runs *outside* the docker network, so frontends call
> backends at `http://localhost:<port>` (the published port), never the compose service name.
> That URL is baked into each frontend at image-build time via a Docker `build.arg` (Vite and
> Angular inline env vars at build time). To repoint a frontend, change the arg in
> `docker-compose.yml` and rebuild.

## Smoke-test each backend (curl)

```bash
# SkyScout — flights (4001)
curl -X POST http://localhost:4001/search_flights \
  -H "Content-Type: application/json" -d '{"origin":"JFK","destination":"LHR"}'
curl -X POST http://localhost:4001/get_flight_details \
  -H "Content-Type: application/json" -d '{"flightId":"FL-1001"}'

# Roost — hotels (4002)   (≥2 options per city so you can compare on price)
curl -X POST http://localhost:4002/search_hotels \
  -H "Content-Type: application/json" -d '{"city":"London","nights":3}'
curl -X POST http://localhost:4002/get_hotel_details \
  -H "Content-Type: application/json" -d '{"hotelId":"HT-2001"}'

# PennyPilot — budget (4003) — Django + DRF + Postgres, per-user, JWT auth. Base path /api.
# 1) login (seeded user) to get a JWT access token, then send: Authorization: Bearer <access>
curl -X POST http://localhost:4003/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"user@pennypilot.dev","password":"user12345"}'
# 2) use the returned access token (export TOKEN=...) on the budget endpoints:
curl -X POST http://localhost:4003/api/budgets \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Groceries","total_amount":"500.00","currency":"USD","period":"MONTHLY","start_date":"2026-01-01"}'
# 3) record an expense against the returned budget id, then read its status:
curl -X POST http://localhost:4003/api/budgets/$BUDGET_ID/expenses \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":"120.00","date":"2026-01-15","description":"shopping"}'
curl http://localhost:4003/api/budgets/$BUDGET_ID/status -H "Authorization: Bearer $TOKEN"
# Interactive docs: http://localhost:4003/docs   ·   Django admin: http://localhost:4003/admin
#   (seeded accounts: admin@pennypilot.dev / admin12345,  user@pennypilot.dev / user12345)

# Weathervane — weather (4004)
curl -X POST http://localhost:4004/get_forecast \
  -H "Content-Type: application/json" -d '{"city":"London","days":5}'

# TripWeaver — itinerary (4005) — composes the four inputs (no backend-to-backend calls)
curl -X POST http://localhost:4005/build_itinerary \
  -H "Content-Type: application/json" \
  -d '{"flight":{"flightId":"FL-1001","airline":"Skyline Airways","origin":"JFK","destination":"LHR","departureTime":"2026-07-01T08:30:00Z","arrivalTime":"2026-07-01T20:15:00Z","price":742.0,"stops":0},"hotel":{"hotelId":"HT-2001","name":"The Thames View","starRating":4,"pricePerNight":180.0,"totalPrice":540.0,"amenities":["WiFi","Breakfast"]},"forecast":[{"date":"2026-07-01","high":24.0,"low":15.0,"condition":"Sunny"}],"budget":{"totalBudget":5000.0,"spent":1200.0,"remaining":3800.0}}'
```

## Project layout

```
travel-planner/
├── docker-compose.yml          # 10 services + a Postgres db for PennyPilot
├── contracts/                  # language-neutral shape + endpoint docs (one per product)
├── SkyScout/   backend/ (Node+TS)            frontend/ (React)     # flights
├── Roost/      backend/ (Spring Boot)        frontend/ (Angular)   # hotels
├── PennyPilot/ backend/ (Django + Postgres)  frontend/ (Svelte)    # budget
├── Weathervane/backend/ (Go)                 frontend/ (Vue)       # weather
└── TripWeaver/ backend/ (ASP.NET)            frontend/ (SolidJS)   # itinerary
```

Every `backend/` and `frontend/` has its own `Dockerfile` + `.dockerignore`; every frontend
also has an `nginx.conf` (SPA fallback) used to serve its static build.

## Architecture notes (for the later A2A phase)

Each backend keeps two layers separate:

- **Domain layer** — pure business logic (plain functions/classes/records) with typed inputs
  and outputs. It never touches HTTP. This is exactly what the A2A executor will wrap later.
- **HTTP layer** — a thin server exposing one `POST /<skill>` endpoint per skill: parse body →
  call a domain function → return JSON. It exists only so the product runs standalone now.

No backend imports or calls another backend. **PennyPilot** is a production-grade budget & expense
API (Django + DRF + **PostgreSQL**, **JWT** auth) under base path `/api`. All business logic lives in a
transport-agnostic **service/selector layer** (`apps/budgets/services.py`, `selectors.py`, pure rules in
`domain.py`) that the A2A executor will wrap later — DRF views stay thin. Recording an expense row-locks
the budget (`SELECT … FOR UPDATE`) so it can never overspend or double-count under concurrency. Interactive
docs at `http://localhost:4003/docs`; Django **admin** at `http://localhost:4003/admin`
(`admin@pennypilot.dev` / `admin12345`).

## Run a single product standalone (without Docker)

Each backend can run on its own with its native toolchain (frontends default to
`http://localhost:<backendPort>` so they work against a standalone backend too).

```bash
# SkyScout backend (Node 22+)
cd SkyScout/backend && npm install && npm run dev          # or: npm run build && npm start  → :4001

# Roost backend (JDK 21 + Maven)
cd Roost/backend && mvn spring-boot:run                     # → :4002

# PennyPilot backend (Python 3.12+, needs Postgres via DATABASE_URL or POSTGRES_* env vars)
cd PennyPilot/backend && pip install -r requirements.txt && \
  DATABASE_URL=postgresql://pennypilot:pennypilot@localhost:5432/pennypilot \
  python manage.py migrate && python manage.py seed && \
  python manage.py runserver 0.0.0.0:4003                    # → :4003 (REST /api, docs /docs, admin /admin)

# Weathervane backend (Go 1.23+)
cd Weathervane/backend && go run ./cmd/server               # → :4004

# TripWeaver backend (.NET 8 SDK)
cd TripWeaver/backend && dotnet run                         # → :4005

# any Vite frontend (Node 22+)
cd SkyScout/frontend && npm install && npm run dev          # Vite dev port (see terminal)
# Roost (Angular):
cd Roost/frontend && npm install && npm start               # → :4200
```

Override a frontend's backend URL when running standalone by setting the build/env var
(`VITE_API_URL` for the Vite apps, `API_URL` for Angular) before building.
