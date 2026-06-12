import { http, HttpResponse } from "msw";

import {
  ADMIN_TOKEN,
  adminUser,
  istanbul,
  istanbulCurrent,
  istanbulForecast,
  locations,
  USER_TOKEN,
  standardUser,
} from "./fixtures";

const API = "http://localhost:4004";

function errorEnvelope(code: string, message: string, details?: Record<string, string>) {
  return { error: { code, message, details, requestId: "test-request" } };
}

export const handlers = [
  http.get(`${API}/api/locations`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").toLowerCase();
    const country = (url.searchParams.get("country") ?? "").toUpperCase();
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "20");

    const filtered = locations.filter(
      (l) =>
        (!q || l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q)) &&
        (!country || l.country === country),
    );
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return HttpResponse.json({
      data,
      meta: {
        page,
        pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      },
    });
  }),

  http.get(`${API}/api/locations/:id`, ({ params }) => {
    const found = locations.find((l) => l.id === params.id);
    if (!found) {
      return HttpResponse.json(errorEnvelope("not_found", "Location not found"), { status: 404 });
    }
    return HttpResponse.json({ data: found });
  }),

  http.get(`${API}/api/forecast`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("locationId") === istanbul.id || url.searchParams.get("city")) {
      return HttpResponse.json({ data: istanbulForecast });
    }
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API}/api/weather/current`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("locationId") === istanbul.id) {
      return HttpResponse.json({ data: istanbulCurrent });
    }
    return HttpResponse.json(errorEnvelope("not_found", "No current weather"), { status: 404 });
  }),

  http.post(`${API}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === adminUser.email && body.password === "admin12345") {
      return HttpResponse.json({ data: { token: ADMIN_TOKEN, user: adminUser } });
    }
    if (body.email === standardUser.email && body.password === "user12345") {
      return HttpResponse.json({ data: { token: USER_TOKEN, user: standardUser } });
    }
    return HttpResponse.json(errorEnvelope("unauthorized", "Invalid email or password"), {
      status: 401,
    });
  }),

  http.post(`${API}/api/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === adminUser.email) {
      return HttpResponse.json(errorEnvelope("conflict", "Email already registered"), {
        status: 409,
      });
    }
    return HttpResponse.json(
      { data: { token: USER_TOKEN, user: { ...standardUser, email: body.email } } },
      { status: 201 },
    );
  }),

  http.get(`${API}/api/auth/me`, ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (auth === `Bearer ${ADMIN_TOKEN}`) return HttpResponse.json({ data: adminUser });
    if (auth === `Bearer ${USER_TOKEN}`) return HttpResponse.json({ data: standardUser });
    return HttpResponse.json(errorEnvelope("unauthorized", "Unauthorized"), { status: 401 });
  }),

  http.post(`${API}/api/locations`, async ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${ADMIN_TOKEN}`) {
      return HttpResponse.json(errorEnvelope("forbidden", "Admins only"), { status: 403 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        data: {
          id: "33333333-3333-3333-3333-333333333333",
          createdAt: "2026-06-12T00:00:00Z",
          updatedAt: "2026-06-12T00:00:00Z",
          ...body,
        },
      },
      { status: 201 },
    );
  }),

  http.put(`${API}/api/locations/:id/forecast`, async ({ request }) => {
    const auth = request.headers.get("Authorization");
    if (auth !== `Bearer ${ADMIN_TOKEN}`) {
      return HttpResponse.json(errorEnvelope("forbidden", "Admins only"), { status: 403 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ data: body });
  }),
];
