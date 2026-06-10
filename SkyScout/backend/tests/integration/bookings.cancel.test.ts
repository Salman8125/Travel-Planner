import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { bearer, bookingBody } from "../helpers/fixtures.js";
import { availableSeats, createAdmin, createUser, seedFlight, truncateAll } from "../helpers/db.js";

const app = buildApp();

beforeEach(async () => {
  await truncateAll();
});

async function book(token: string, flightId: string): Promise<string> {
  const r = await request(app).post("/api/bookings").set(bearer(token)).send(bookingBody(flightId));
  return r.body.data.reference;
}

describe("bookings cancel", () => {
  it("cancel → 200, releases seats; double-cancel idempotent (no double release)", async () => {
    const token = (await createUser("u@e.com", "password123")).token;
    const f = await seedFlight({ seats: 10 });
    const ref = await book(token, f.flightId);
    expect(await availableSeats(f.flightId)).toBe(9);

    const c1 = await request(app).post(`/api/bookings/${ref}/cancel`).set(bearer(token));
    expect(c1.status).toBe(200);
    expect(c1.body.data.status).toBe("CANCELLED");
    expect(await availableSeats(f.flightId)).toBe(10);

    const c2 = await request(app).post(`/api/bookings/${ref}/cancel`).set(bearer(token));
    expect(c2.status).toBe(200);
    expect(await availableSeats(f.flightId)).toBe(10);
  });

  it("past the cancellation cutoff → 409", async () => {
    const token = (await createUser("u@e.com", "password123")).token;
    const f = await seedFlight({ seats: 10, departure: new Date(Date.now() + 60 * 60 * 1000) });
    const ref = await book(token, f.flightId);
    const c = await request(app).post(`/api/bookings/${ref}/cancel`).set(bearer(token));
    expect(c.status).toBe(409);
    expect(c.body.error.code).toBe("cancellation_window_closed");
  });

  it("cross-user cancel → 404; admin can cancel", async () => {
    const owner = (await createUser("owner@e.com", "password123")).token;
    const mallory = (await createUser("mallory@e.com", "password123")).token;
    const admin = await createAdmin("admin@e.com", "password123");
    const f = await seedFlight({ seats: 10 });
    const ref = await book(owner, f.flightId);

    expect((await request(app).post(`/api/bookings/${ref}/cancel`).set(bearer(mallory))).status).toBe(404);
    expect((await request(app).post(`/api/bookings/${ref}/cancel`).set(bearer(admin.token))).status).toBe(200);
  });
});
