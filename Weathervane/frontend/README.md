# Weathervane — Frontend

Production Vue 3 SPA for the Weathervane weather backend: public location search, current
conditions, multi-day daily forecasts (cards + temperature trend chart), a client-side °C/°F
toggle, auth, and a role-guarded admin area.

## Stack
- **Vue 3** (`<script setup>`, TypeScript strict) + **Vite**
- **Vue Router 4** — public / auth / admin route groups, lazy chunks, admin-only guard
- **@tanstack/vue-query** owns ALL server state; **Pinia** owns ONLY client state (auth token, theme, unit)
- **axios** with interceptors (Bearer attach, 401 → clear session + redirect, error-envelope normalize)
- **VeeValidate + Zod** forms; **Tailwind + shadcn-vue** (reka-ui) UI; **vue-chartjs** chart;
  **date-fns / date-fns-tz** timezone rendering; **vue-sonner** toasts
- Types generated from the backend OpenAPI via **openapi-typescript** (committed)

## Develop
```bash
npm install
npm run gen:api      # regenerate src/lib/api/types.ts from the committed ./openapi.yaml
npm run dev          # http://localhost:3004 (expects backend on :4004)
npm run typecheck
npm run test         # Vitest + MSW
npm run build        # vue-tsc + vite build → dist/
npm run e2e          # Playwright (needs the Docker stack up)
```
`VITE_API_URL` (default `http://localhost:4004`) is the backend base URL, baked at build time.

## API types
`src/lib/api/types.ts` is generated from `openapi.yaml` (a committed copy of the backend spec) and is
committed so the Docker build never needs a running backend. `gen:api` regenerates from the local
file; `gen:api:live` refreshes it from `http://localhost:4004/openapi.yaml`. The hand-written overlay
`src/lib/api/models.ts` adds the `{data}` / `{data,meta}` envelopes, the `Condition` enum, and the
`CurrentWeather` output type (the OpenAPI omits it) — generated DTOs are never re-declared.

## Architecture
- `src/lib/` — api client, generated types + overlay, query keys, utils (tz dates, °C↔°F, icons), composables
- `src/stores/` — Pinia: `auth` (token+user, token persisted), `preferences` (unit, persisted), `ui` (theme, persisted)
- `src/features/{auth,locations,forecast,admin}/` — self-contained: `api.ts`, `queries.ts`/`mutations.ts`, `schemas.ts`, `components/`
- `src/components/ui/` — shadcn-vue primitives; `src/components/common/` — shared display/state components
- `src/views/` — thin route components; `src/app/` — router (+ guards) and query-client config

## Security note (decision)
The backend issues an **access-token-only JWT** (no refresh token). We persist the token to
`localStorage` (via `pinia-plugin-persistedstate`) so an admin stays signed in across reloads. The
tradeoff: localStorage is readable by JavaScript, so a successful XSS could exfiltrate the token —
mitigated by keeping token lifetime modest, never logging tokens, and keeping the authenticated
surface small (almost the entire app is public; only `/admin` needs a session). On any `401` the
axios interceptor clears the session and redirects to `/login` — there is no refresh-and-retry flow.
