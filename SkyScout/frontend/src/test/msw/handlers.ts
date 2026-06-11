import { http, HttpResponse } from "msw";

import {
  airlinesFixture,
  airportsFixture,
  authResultFixture,
  bookingFixture,
  flightFixture,
  userFixture,
} from "./fixtures";

const API = "http://localhost:4001";

function meta(total: number, page = 1, pageSize = 10) {
  return { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export const handlers = [
  http.post(`${API}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === "wrong") {
      return HttpResponse.json(
        { error: { code: "unauthorized", message: "Invalid credentials", requestId: "req-1" } },
        { status: 401 },
      );
    }
    return HttpResponse.json({ data: authResultFixture });
  }),

  http.post(`${API}/api/auth/register`, async () => {
    return HttpResponse.json({ data: authResultFixture }, { status: 201 });
  }),

  http.get(`${API}/api/auth/me`, () => HttpResponse.json({ data: userFixture })),

  http.post(`${API}/api/flights/search`, () =>
    HttpResponse.json({ data: { outbound: { data: [flightFixture], meta: meta(1) }, inbound: null } }),
  ),

  http.get(`${API}/api/flights/:id`, () => HttpResponse.json({ data: flightFixture })),

  http.post(`${API}/api/bookings`, () => HttpResponse.json({ data: bookingFixture }, { status: 201 })),

  http.get(`${API}/api/bookings`, () =>
    HttpResponse.json({ data: [bookingFixture], meta: meta(1) }),
  ),

  http.get(`${API}/api/bookings/:reference`, () => HttpResponse.json({ data: bookingFixture })),

  http.post(`${API}/api/bookings/:reference/cancel`, () =>
    HttpResponse.json({ data: { ...bookingFixture, status: "CANCELLED", cancelledAt: "2026-06-10T10:00:00.000Z" } }),
  ),

  http.get(`${API}/api/airports`, () =>
    HttpResponse.json({ data: airportsFixture, meta: meta(airportsFixture.length) }),
  ),

  http.get(`${API}/api/airlines`, () =>
    HttpResponse.json({ data: airlinesFixture, meta: meta(airlinesFixture.length) }),
  ),
];
