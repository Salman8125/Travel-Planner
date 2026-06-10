import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { bearer, bookingBody } from "../helpers/fixtures.js";
import { availableSeats, createUser, seedFlight, truncateAll } from "../helpers/db.js";

const app = buildApp();
let token: string;

beforeEach(async () => {
  await truncateAll();
  token = (await createUser("u@e.com", "password123")).token;
});

describe("bookings idempotency", () => {
  it("same Idempotency-Key replays the original booking (decrement once)", async () => {
    const f = await seedFlight({ seats: 10 });
    const body = bookingBody(f.flightId);
    const first = await request(app).post("/api/bookings").set(bearer(token)).set("Idempotency-Key", "k1").send(body);
    const second = await request(app).post("/api/bookings").set(bearer(token)).set("Idempotency-Key", "k1").send(body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.data.reference).toBe(first.body.data.reference);
    expect(await availableSeats(f.flightId)).toBe(9);
  });

  it("concurrent requests with the same key create only one booking", async () => {
    const f = await seedFlight({ seats: 10 });
    const body = bookingBody(f.flightId);
    const [a, b] = await Promise.all([
      request(app).post("/api/bookings").set(bearer(token)).set("Idempotency-Key", "k2").send(body),
      request(app).post("/api/bookings").set(bearer(token)).set("Idempotency-Key", "k2").send(body),
    ]);
    expect([a.body.data.reference, b.body.data.reference]).toEqual([a.body.data.reference, a.body.data.reference]);
    expect(await availableSeats(f.flightId)).toBe(9);
  });
});
