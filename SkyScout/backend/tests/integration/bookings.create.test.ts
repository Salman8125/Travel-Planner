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

describe("bookings create", () => {
  it("happy path → 201 CONFIRMED + PNR, inventory decremented", async () => {
    const f = await seedFlight({ seats: 10 });
    const r = await request(app).post("/api/bookings").set(bearer(token)).send(bookingBody(f.flightId));
    expect(r.status).toBe(201);
    expect(r.body.data.status).toBe("CONFIRMED");
    expect(r.body.data.reference).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(r.body.data.totalPrice).toBe("200.00");
    expect(await availableSeats(f.flightId)).toBe(9);
  });

  it("insufficient seats → 409", async () => {
    const f = await seedFlight({ seats: 0 });
    const r = await request(app).post("/api/bookings").set(bearer(token)).send(bookingBody(f.flightId));
    expect(r.status).toBe(409);
    expect(r.body.error.code).toBe("insufficient_seats");
  });

  it("payment failure (+fail email) → 402, FAILED, seats released", async () => {
    const f = await seedFlight({ seats: 10 });
    const r = await request(app).post("/api/bookings").set(bearer(token)).send(bookingBody(f.flightId, { email: "x+fail@e.com" }));
    expect(r.status).toBe(402);
    expect(await availableSeats(f.flightId)).toBe(10);
  });

  it("invalid passenger (infant age) → 400", async () => {
    const f = await seedFlight();
    const body = { ...bookingBody(f.flightId), passengers: [{ firstName: "Baby", lastName: "X", dateOfBirth: "2010-01-01", type: "INFANT" }] };
    const r = await request(app).post("/api/bookings").set(bearer(token)).send(body);
    expect(r.status).toBe(400);
  });

  it("unauthenticated → 401", async () => {
    const f = await seedFlight();
    expect((await request(app).post("/api/bookings").send(bookingBody(f.flightId))).status).toBe(401);
  });
});
