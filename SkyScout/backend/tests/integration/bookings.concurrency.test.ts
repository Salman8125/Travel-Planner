import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../../src/app.js";
import { bearer, bookingBody } from "../helpers/fixtures.js";
import { availableSeats, createUser, seedFlight, truncateAll } from "../helpers/db.js";

const app = buildApp();

beforeEach(async () => {
  await truncateAll();
});

describe("bookings concurrency", () => {
  it("N concurrent bookings for the last seat → exactly one 201, rest 409, no overbooking", async () => {
    const token = (await createUser("u@e.com", "password123")).token;
    const f = await seedFlight({ seats: 1, cabin: "ECONOMY" });
    const N = 10;

    const results = await Promise.all(
      Array.from({ length: N }, (_, i) =>
        request(app).post("/api/bookings").set(bearer(token)).send(bookingBody(f.flightId, { email: `racer${i}@e.com` })),
      ),
    );

    const codes = results.map((r) => r.status);
    expect(codes.filter((c) => c === 201)).toHaveLength(1);
    expect(codes.filter((c) => c === 409)).toHaveLength(N - 1);
    expect(await availableSeats(f.flightId)).toBe(0);
  });
});
